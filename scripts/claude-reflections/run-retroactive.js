#!/usr/bin/env node
/**
 * Run retroactive reviews for specific dates
 *
 * Usage:
 *   node run-retroactive.js daily 2025-12-17
 *   node run-retroactive.js daily last3    # Last 3 days
 *   node run-retroactive.js weekly 2025-12-08  # Week starting on that Sunday
 */

const fs = require('fs');
const path = require('path');
const { collectConversations, generateStats } = require('./collector');
const { analyze } = require('./analyze-with-claude');
const config = require('./config');

const PROMPTS_DIR = path.join(__dirname, 'prompts');

// Ensure output dirs exist
Object.values(config.outputs).forEach(dir => {
  fs.mkdirSync(path.join(dir, 'Daily'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'Weekly'), { recursive: true });
});

function loadPrompt(type) {
  const promptPath = path.join(PROMPTS_DIR, `${type}.md`);
  return fs.existsSync(promptPath)
    ? fs.readFileSync(promptPath, 'utf-8')
    : `Analyze these ${type} conversations and extract key learnings.`;
}

function prepareConversationSummary(data) {
  const { stats, conversations } = data;
  let summary = `## Statistics\n`;
  summary += `- Total Conversations: ${stats.totalConversations}\n`;
  summary += `- Total Messages: ${stats.totalMessages}\n`;
  summary += `- Projects: ${Object.keys(stats.projectBreakdown).join(', ')}\n\n`;
  summary += `## Conversations\n\n`;

  for (const conv of conversations) {
    summary += `### ${conv.project.split('/').pop()} (${conv.messageCount} messages)\n`;
    for (const msg of conv.messages.slice(0, 15)) {
      const role = msg.type === 'assistant' ? '**Claude**' : '**User**';
      const content = msg.content?.slice(0, 800) || '';
      summary += `${role}: ${content}\n\n`;
    }
    summary += `---\n\n`;
  }

  return summary.slice(0, 120000);
}

async function analyzeConversations(content, prompt) {
  // Uses Claude Code headless mode (your subscription) or API key if available
  return await analyze(prompt, content, { timeout: 180000 });
}

function saveToObsidian(analysis, date, type) {
  const dateStr = date.toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  const subDir = type === 'daily' ? 'Daily' : 'Weekly';
  const filename = type === 'daily'
    ? `${dateStr} ${dayName}.md`
    : `Week of ${dateStr}.md`;

  // Obsidian-formatted output
  const output = `---
date: ${dateStr}
type: ${type}-review
generated: ${new Date().toISOString()}
tags:
  - claude-reflections
  - ${type}
---

# ${type === 'daily' ? `${dayName}, ${dateStr}` : `Week of ${dateStr}`}

${analysis}
`;

  // Save to both locations
  Object.entries(config.outputs).forEach(([name, basePath]) => {
    const filepath = path.join(basePath, subDir, filename);
    fs.writeFileSync(filepath, output);
    console.log(`Saved to ${name}: ${filepath}`);
  });

  return filename;
}

function notify(title, message) {
  if (config.notifications.enabled) {
    const script = `display notification "${message}" with title "${title}" sound name "${config.notifications.sound}"`;
    require('child_process').execSync(`osascript -e '${script}'`);
  }
}

async function runDailyReview(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  console.log(`\n=== Daily Review for ${dateStr} ===`);
  console.log(`Range: ${start.toISOString()} to ${end.toISOString()}`);

  const conversations = await collectConversations(start.toISOString(), end.toISOString());
  const stats = generateStats(conversations);

  console.log(`Found: ${stats.totalConversations} conversations, ${stats.totalMessages} messages`);

  if (stats.totalConversations === 0) {
    console.log('No conversations found. Skipping.');
    return null;
  }

  const prompt = loadPrompt('daily');
  const summary = prepareConversationSummary({ stats, conversations });

  console.log('Analyzing with Claude...');
  const analysis = await analyzeConversations(summary, prompt);

  const filename = saveToObsidian(analysis, date, 'daily');
  notify('Claude Reflection', `Daily review for ${dateStr} complete`);

  return filename;
}

async function runWeeklyReview(sundayStr) {
  const sunday = new Date(sundayStr + 'T12:00:00');
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  console.log(`\n=== Weekly Review for week of ${sundayStr} ===`);
  console.log(`Range: ${sunday.toISOString()} to ${saturday.toISOString()}`);

  const conversations = await collectConversations(sunday.toISOString(), saturday.toISOString());
  const stats = generateStats(conversations);

  console.log(`Found: ${stats.totalConversations} conversations, ${stats.totalMessages} messages`);

  if (stats.totalConversations === 0) {
    console.log('No conversations found. Skipping.');
    return null;
  }

  const prompt = loadPrompt('weekly');
  const summary = prepareConversationSummary({ stats, conversations });

  console.log('Analyzing with Claude...');
  const analysis = await analyzeConversations(summary, prompt);

  const filename = saveToObsidian(analysis, sunday, 'weekly');
  notify('Claude Reflection', `Weekly review complete`);

  return filename;
}

async function main() {
  const [,, type, dateArg] = process.argv;

  if (!type || !dateArg) {
    console.log(`
Claude Retroactive Review Runner

Usage:
  node run-retroactive.js daily <date>      # Single day (YYYY-MM-DD)
  node run-retroactive.js daily last3       # Last 3 days
  node run-retroactive.js daily last5       # Last 5 days
  node run-retroactive.js weekly <sunday>   # Week starting on Sunday

Examples:
  node run-retroactive.js daily 2025-12-17
  node run-retroactive.js daily last3
  node run-retroactive.js weekly 2025-12-08
    `);
    process.exit(0);
  }

  if (type === 'daily') {
    if (dateArg.startsWith('last')) {
      const days = parseInt(dateArg.replace('last', '')) || 3;
      console.log(`Running daily reviews for last ${days} days...`);

      for (let i = 1; i <= days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        await runDailyReview(dateStr);
      }
    } else {
      await runDailyReview(dateArg);
    }
  } else if (type === 'weekly') {
    await runWeeklyReview(dateArg);
  }

  console.log('\nDone!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runDailyReview, runWeeklyReview };
