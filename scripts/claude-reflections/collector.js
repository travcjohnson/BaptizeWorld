#!/usr/bin/env node
/**
 * Claude Conversation Collector
 *
 * Parses Claude Code JSONL conversation files and filters by date range.
 * Outputs structured data ready for AI analysis.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
const HISTORY_FILE = path.join(CLAUDE_DIR, 'history.jsonl');

/**
 * Parse a JSONL file and return array of objects
 */
async function parseJSONL(filePath) {
  const entries = [];

  if (!fs.existsSync(filePath)) {
    return entries;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        entries.push(JSON.parse(line));
      } catch (e) {
        // Skip malformed lines
      }
    }
  }

  return entries;
}

/**
 * Get all project directories
 */
function getProjectDirs() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  return fs.readdirSync(PROJECTS_DIR)
    .filter(name => !name.startsWith('.'))
    .map(name => ({
      name: name.replace(/-/g, '/').replace(/^\//, ''),
      path: path.join(PROJECTS_DIR, name)
    }));
}

/**
 * Get all conversation files from a project directory
 */
function getConversationFiles(projectPath) {
  if (!fs.existsSync(projectPath)) {
    return [];
  }

  return fs.readdirSync(projectPath)
    .filter(name => name.endsWith('.jsonl'))
    .map(name => path.join(projectPath, name));
}

/**
 * Filter entries by date range
 */
function filterByDateRange(entries, startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return entries.filter(entry => {
    const timestamp = entry.timestamp
      ? (typeof entry.timestamp === 'string' ? new Date(entry.timestamp).getTime() : entry.timestamp)
      : null;

    return timestamp && timestamp >= start && timestamp <= end;
  });
}

/**
 * Extract meaningful content from a message entry
 */
function extractContent(entry) {
  const result = {
    timestamp: entry.timestamp,
    sessionId: entry.sessionId,
    type: entry.type || entry.userType,
    project: entry.cwd || entry.project,
    model: entry.message?.model,
    content: null,
    thinking: null,
    toolCalls: []
  };

  // Handle user messages
  if (entry.type === 'user' || entry.userType === 'external') {
    if (entry.message?.content) {
      if (Array.isArray(entry.message.content)) {
        result.content = entry.message.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');
      } else {
        result.content = entry.message.content;
      }
    } else if (entry.display) {
      result.content = entry.display;
    }
  }

  // Handle assistant messages
  if (entry.type === 'assistant' && entry.message?.content) {
    const content = entry.message.content;

    if (Array.isArray(content)) {
      result.content = content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');

      result.thinking = content
        .filter(c => c.type === 'thinking')
        .map(c => c.thinking)
        .join('\n');

      result.toolCalls = content
        .filter(c => c.type === 'tool_use')
        .map(c => ({ name: c.name, id: c.id }));
    }
  }

  return result;
}

/**
 * Collect conversations for a date range
 */
async function collectConversations(startDate, endDate, options = {}) {
  const { includeThinking = false, projectFilter = null } = options;

  const conversations = [];
  const projects = getProjectDirs();

  // Filter projects if specified
  const targetProjects = projectFilter
    ? projects.filter(p => p.name.includes(projectFilter))
    : projects;

  for (const project of targetProjects) {
    const files = getConversationFiles(project.path);

    for (const file of files) {
      const entries = await parseJSONL(file);
      const filtered = filterByDateRange(entries, startDate, endDate);

      if (filtered.length > 0) {
        const sessionId = path.basename(file, '.jsonl');
        const messages = filtered.map(extractContent).filter(m => m.content);

        if (messages.length > 0) {
          conversations.push({
            sessionId,
            project: project.name,
            messageCount: messages.length,
            timeRange: {
              start: messages[0].timestamp,
              end: messages[messages.length - 1].timestamp
            },
            messages: messages.map(m => ({
              type: m.type,
              content: m.content,
              ...(includeThinking && m.thinking ? { thinking: m.thinking } : {}),
              toolsUsed: m.toolCalls.map(t => t.name)
            }))
          });
        }
      }
    }
  }

  // Sort by timestamp
  conversations.sort((a, b) => {
    const aTime = new Date(a.timeRange.start).getTime();
    const bTime = new Date(b.timeRange.start).getTime();
    return aTime - bTime;
  });

  return conversations;
}

/**
 * Get yesterday's date range
 */
function getYesterdayRange() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  return {
    start: yesterday.toISOString(),
    end: endOfYesterday.toISOString()
  };
}

/**
 * Get last week's date range (Sunday to Saturday)
 */
function getLastWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Find last Sunday
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - dayOfWeek - 7);
  lastSunday.setHours(0, 0, 0, 0);

  // Find last Saturday
  const lastSaturday = new Date(lastSunday);
  lastSaturday.setDate(lastSunday.getDate() + 6);
  lastSaturday.setHours(23, 59, 59, 999);

  return {
    start: lastSunday.toISOString(),
    end: lastSaturday.toISOString()
  };
}

/**
 * Generate summary statistics
 */
function generateStats(conversations) {
  const stats = {
    totalConversations: conversations.length,
    totalMessages: 0,
    projectBreakdown: {},
    toolsUsed: {},
    modelsUsed: {}
  };

  for (const conv of conversations) {
    stats.totalMessages += conv.messageCount;

    // Project breakdown
    const projectName = conv.project.split('/').pop() || 'unknown';
    stats.projectBreakdown[projectName] = (stats.projectBreakdown[projectName] || 0) + 1;

    // Tools used
    for (const msg of conv.messages) {
      for (const tool of msg.toolsUsed || []) {
        stats.toolsUsed[tool] = (stats.toolsUsed[tool] || 0) + 1;
      }
    }
  }

  return stats;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  let range;
  let options = { includeThinking: args.includes('--thinking') };

  switch (command) {
    case 'yesterday':
      range = getYesterdayRange();
      break;
    case 'week':
      range = getLastWeekRange();
      break;
    case 'range':
      range = { start: args[1], end: args[2] };
      break;
    default:
      console.log(`
Claude Conversation Collector

Usage:
  node collector.js yesterday          # Get yesterday's conversations
  node collector.js week               # Get last week's conversations
  node collector.js range <start> <end> # Custom date range (ISO format)

Options:
  --thinking    Include Claude's thinking content
  --stats       Output statistics only

Examples:
  node collector.js yesterday
  node collector.js week --stats
  node collector.js range 2025-12-01 2025-12-07
      `);
      process.exit(0);
  }

  console.error(`Collecting conversations from ${range.start} to ${range.end}...`);

  const conversations = await collectConversations(range.start, range.end, options);
  const stats = generateStats(conversations);

  if (args.includes('--stats')) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log(JSON.stringify({
      dateRange: range,
      stats,
      conversations
    }, null, 2));
  }
}

// Export for use as module
module.exports = {
  collectConversations,
  getYesterdayRange,
  getLastWeekRange,
  generateStats,
  parseJSONL
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
