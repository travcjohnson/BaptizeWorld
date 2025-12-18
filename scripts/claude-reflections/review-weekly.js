#!/usr/bin/env node
/**
 * Weekly Claude Conversation Review
 *
 * Runs Sunday evening to analyze the past week's conversations.
 * Different perspective from daily - focuses on patterns and growth.
 */

const fs = require('fs');
const path = require('path');
const { collectConversations, getLastWeekRange, generateStats } = require('./collector');

const SCRIPTS_DIR = __dirname;
const OUTPUTS_DIR = path.join(SCRIPTS_DIR, 'outputs');
const PROMPTS_DIR = path.join(SCRIPTS_DIR, 'prompts');
const LOGS_DIR = path.join(SCRIPTS_DIR, 'logs');

// Ensure directories exist
[OUTPUTS_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Load prompt template
 */
function loadPrompt(name) {
  const promptPath = path.join(PROMPTS_DIR, `${name}.md`);
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }
  return getDefaultWeeklyPrompt();
}

/**
 * Default weekly review prompt - different POV from daily
 */
function getDefaultWeeklyPrompt() {
  return `# Weekly Learning Retrospective

You are analyzing a developer's week of conversations with Claude Code.
Take a zoomed-out view - look for patterns, growth, and themes across the week.

## Your Analysis Should Include:

### 1. Week in Review
- What was the main focus this week?
- How did the work evolve from Monday to Sunday?
- What major milestones or completions occurred?

### 2. Learning Trajectory
- Skills that improved over the week
- Concepts that went from confusion to clarity
- Recurring challenges or sticking points

### 3. Pattern Recognition
- Common problem-solving approaches used
- Tools and techniques relied on most
- Time of day / productivity patterns (if visible)

### 4. Growth Insights
- What would "Monday you" be surprised to know?
- What became easier by the end of the week?
- What's the next logical skill to develop?

### 5. Content Ideas (for authentic sharing)
- Stories of struggle → breakthrough
- Unique perspectives gained
- Tips that would help others on similar journeys
- Honest reflections worth sharing

### 6. Next Week Intentions
- Unfinished threads to pick up
- Skills to deliberately practice
- Questions still unanswered

## Output Format:
Write this as if you're a thoughtful mentor helping someone see their own progress.
Be specific with examples but focus on the narrative arc of the week.
Highlight genuine insights, not just a summary of tasks.

---

## This Week's Conversations:
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

  const summary = prepareWeeklySummary(conversationData);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', // Use Sonnet for cost efficiency on weekly
      max_tokens: 8192,
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
 * Prepare weekly summary - aggregate by day
 */
function prepareWeeklySummary(data) {
  const { stats, conversations } = data;

  // Group conversations by day
  const byDay = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (const conv of conversations) {
    const date = new Date(conv.timeRange.start);
    const dayName = days[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    const key = `${dayName} (${dateStr})`;

    if (!byDay[key]) {
      byDay[key] = [];
    }
    byDay[key].push(conv);
  }

  let summary = `## Week Overview\n`;
  summary += `- Total Conversations: ${stats.totalConversations}\n`;
  summary += `- Total Messages: ${stats.totalMessages}\n`;
  summary += `- Projects: ${Object.keys(stats.projectBreakdown).join(', ')}\n`;
  summary += `- Top Tools: ${Object.entries(stats.toolsUsed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tool, count]) => `${tool} (${count})`)
    .join(', ')}\n\n`;

  // Summarize each day
  for (const [day, convs] of Object.entries(byDay)) {
    summary += `## ${day}\n`;
    summary += `_${convs.length} conversation(s)_\n\n`;

    for (const conv of convs.slice(0, 5)) { // Limit per day
      summary += `### ${conv.project.split('/').pop()}\n`;

      // Get first user message as topic indicator
      const userMessages = conv.messages.filter(m => m.type !== 'assistant');
      if (userMessages.length > 0) {
        const topic = userMessages[0].content?.slice(0, 300) || '';
        summary += `Topic: ${topic}...\n\n`;
      }

      // Key exchanges (first 5 messages)
      for (const msg of conv.messages.slice(0, 5)) {
        const role = msg.type === 'assistant' ? 'Claude' : 'User';
        const content = msg.content?.slice(0, 500) || '';
        summary += `**${role}**: ${content}\n\n`;
      }
    }
  }

  // Truncate if needed
  if (summary.length > 150000) {
    summary = summary.slice(0, 150000) + '\n\n[...truncated...]';
  }

  return summary;
}

/**
 * Save review output
 */
function saveOutput(analysis, weekStart, type = 'weekly') {
  const dateStr = weekStart.toISOString().split('T')[0];
  const filename = `${type}-review-week-of-${dateStr}.md`;
  const filepath = path.join(OUTPUTS_DIR, filename);

  const output = `# Weekly Review: Week of ${dateStr}
Generated: ${new Date().toISOString()}

${analysis}
`;

  fs.writeFileSync(filepath, output);
  return filepath;
}

/**
 * Log execution
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  const logFile = path.join(LOGS_DIR, 'weekly-review.log');
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
  log('Starting weekly review...');

  try {
    const range = getLastWeekRange();
    log(`Date range: ${range.start} to ${range.end}`);

    const conversations = await collectConversations(range.start, range.end, {
      includeThinking: false
    });

    const stats = generateStats(conversations);
    log(`Found ${stats.totalConversations} conversations with ${stats.totalMessages} messages`);

    if (stats.totalConversations === 0) {
      log('No conversations found for last week. Skipping analysis.');
      return;
    }

    // Load prompt and analyze
    const prompt = loadPrompt('weekly');
    const analysis = await analyzeWithClaude({ stats, conversations }, prompt);

    // Save output
    const weekStart = new Date(range.start);
    const outputPath = saveOutput(analysis, weekStart, 'weekly');

    log(`Review saved to: ${outputPath}`);
    console.log('\n' + analysis);

  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Export for testing
module.exports = { prepareWeeklySummary };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
