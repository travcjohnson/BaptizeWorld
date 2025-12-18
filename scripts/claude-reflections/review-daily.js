#!/usr/bin/env node
/**
 * Daily Claude Conversation Review
 *
 * Runs at 4 AM to analyze yesterday's conversations.
 * Uses Claude API to extract learnings and insights.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { collectConversations, getYesterdayRange, generateStats } = require('./collector');
const config = require('./config');

const SCRIPTS_DIR = __dirname;
const OUTPUTS_DIR = path.join(SCRIPTS_DIR, 'outputs');
const PROMPTS_DIR = path.join(SCRIPTS_DIR, 'prompts');
const LOGS_DIR = path.join(SCRIPTS_DIR, 'logs');

// Ensure directories exist
[OUTPUTS_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Ensure Obsidian directories exist
Object.values(config.outputs).forEach(dir => {
  fs.mkdirSync(path.join(dir, 'Daily'), { recursive: true });
});

/**
 * Send macOS notification
 */
function notify(title, message) {
  if (config.notifications?.enabled) {
    try {
      const sound = config.notifications.sound || 'Glass';
      const script = `display notification "${message}" with title "${title}" sound name "${sound}"`;
      execSync(`osascript -e '${script}'`);
    } catch (e) { /* ignore notification errors */ }
  }
}

/**
 * Load prompt template
 */
function loadPrompt(name) {
  const promptPath = path.join(PROMPTS_DIR, `${name}.md`);
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }
  return getDefaultDailyPrompt();
}

/**
 * Default daily review prompt
 */
function getDefaultDailyPrompt() {
  return `# Daily Learning Review

You are analyzing a developer's conversations with Claude Code from yesterday.
Your goal is to extract valuable insights for reflection and content creation.

## Your Analysis Should Include:

### 1. Key Learnings
- What new concepts, patterns, or techniques were explored?
- What "aha moments" or breakthroughs occurred?
- What mistakes were made and corrected?

### 2. Technical Highlights
- Interesting code patterns or solutions
- Tools and libraries discussed
- Architecture decisions made

### 3. Content Opportunities
- Topics that could become blog posts or tutorials
- Struggles that others might relate to
- Unique approaches worth sharing

### 4. Reflection Prompts
- Questions to ponder further
- Areas that need deeper exploration
- Skills to practice

## Output Format:
Provide your analysis in a structured markdown format that's easy to scan.
Be specific - quote actual code or conversations when relevant.
Focus on what's genuinely interesting, not every mundane detail.

---

## Conversations to Analyze:
`;
}

/**
 * Call Claude API for analysis
 */
async function analyzeWithClaude(conversationData, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  // Prepare conversation summary for analysis
  const summary = prepareConversationSummary(conversationData);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: systemPrompt + '\n\n' + summary
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Prepare conversation data for analysis (truncate if needed)
 */
function prepareConversationSummary(data) {
  const { stats, conversations } = data;

  let summary = `## Statistics\n`;
  summary += `- Total Conversations: ${stats.totalConversations}\n`;
  summary += `- Total Messages: ${stats.totalMessages}\n`;
  summary += `- Projects: ${Object.keys(stats.projectBreakdown).join(', ')}\n\n`;

  summary += `## Conversations\n\n`;

  for (const conv of conversations) {
    summary += `### Session: ${conv.sessionId.slice(0, 8)}... (${conv.project})\n`;
    summary += `Messages: ${conv.messageCount}\n\n`;

    // Include user messages and abbreviated assistant responses
    for (const msg of conv.messages.slice(0, 20)) { // Limit messages per conversation
      const role = msg.type === 'assistant' ? '**Claude**' : '**User**';
      const content = msg.content?.slice(0, 1000) || '(no content)';
      summary += `${role}: ${content}\n\n`;

      if (msg.toolsUsed?.length > 0) {
        summary += `_Tools: ${msg.toolsUsed.join(', ')}_\n\n`;
      }
    }

    summary += `---\n\n`;
  }

  // Truncate if too long (keep under ~100k chars for API)
  if (summary.length > 100000) {
    summary = summary.slice(0, 100000) + '\n\n[...truncated for length...]';
  }

  return summary;
}

/**
 * Save review output to both local and Obsidian
 */
function saveOutput(analysis, date, type = 'daily') {
  const dateStr = date.toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  // Obsidian-friendly filename
  const obsidianFilename = `${dateStr} ${dayName}.md`;
  const localFilename = `${type}-review-${dateStr}.md`;

  // Obsidian-formatted output with frontmatter
  const obsidianOutput = `---
date: ${dateStr}
type: daily-review
generated: ${new Date().toISOString()}
tags:
  - claude-reflections
  - daily
---

# ${dayName}, ${dateStr}

${analysis}
`;

  // Save to local backup
  const localPath = path.join(OUTPUTS_DIR, localFilename);
  fs.writeFileSync(localPath, obsidianOutput);

  // Save to Obsidian vault
  const obsidianPath = path.join(config.outputs.obsidian, 'Daily', obsidianFilename);
  fs.writeFileSync(obsidianPath, obsidianOutput);

  return { local: localPath, obsidian: obsidianPath };
}

/**
 * Log execution
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  const logFile = path.join(LOGS_DIR, 'daily-review.log');
  fs.appendFileSync(logFile, logLine);

  if (level === 'error') {
    console.error(logLine);
  } else {
    console.log(logLine);
  }
}

/**
 * Main execution
 */
async function main() {
  log('Starting daily review...');

  try {
    // Get yesterday's conversations
    const range = getYesterdayRange();
    log(`Date range: ${range.start} to ${range.end}`);

    const conversations = await collectConversations(range.start, range.end, {
      includeThinking: false
    });

    const stats = generateStats(conversations);
    log(`Found ${stats.totalConversations} conversations with ${stats.totalMessages} messages`);

    if (stats.totalConversations === 0) {
      log('No conversations found for yesterday. Skipping analysis.');
      return;
    }

    // Load prompt and analyze
    const prompt = loadPrompt('daily');
    const analysis = await analyzeWithClaude({ stats, conversations }, prompt);

    // Save output
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const paths = saveOutput(analysis, yesterday, 'daily');

    log(`Review saved to: ${paths.local}`);
    log(`Obsidian: ${paths.obsidian}`);
    console.log('\n' + analysis);

    // Send notification
    notify('Claude Reflection', `Daily review complete - ${stats.totalConversations} conversations analyzed`);

  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    notify('Claude Reflection Error', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { analyzeWithClaude, prepareConversationSummary };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
