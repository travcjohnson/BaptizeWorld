/**
 * Claude Reflections Configuration
 */

const path = require('path');
const os = require('os');

module.exports = {
  // Where Claude Code stores conversations
  claudeDir: path.join(os.homedir(), '.claude'),

  // Output destinations (reviews go to both)
  outputs: {
    // Local backup
    local: path.join(__dirname, 'outputs'),

    // Obsidian vault - primary destination
    obsidian: path.join(
      os.homedir(),
      'Development/ObsidianVault/Personal Vault/Travis Life OS/Claude Reflections'
    )
  },

  // Schedule (for reference - actual schedule in launchd)
  schedule: {
    daily: { hour: 4, minute: 0 },      // 4:00 AM
    weekly: { weekday: 0, hour: 20 }    // Sunday 8:00 PM
  },

  // Claude API settings
  api: {
    model: 'claude-sonnet-4-20250514',  // Cost-effective for reviews
    maxTokens: 4096
  },

  // Notification settings
  notifications: {
    enabled: true,
    sound: 'Glass'  // macOS notification sound
  }
};
