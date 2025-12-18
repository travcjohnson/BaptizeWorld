#!/usr/bin/env node
/**
 * Analyze conversations using Claude Code headless mode
 *
 * This uses your existing Claude Code subscription/authentication
 * instead of requiring a separate API key.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Run Claude Code in print mode (non-interactive)
 */
async function analyzeWithClaudeCode(prompt, options = {}) {
  const { timeout = 180000 } = options;

  return new Promise((resolve, reject) => {
    let output = '';
    let error = '';

    // Use claude -p (print mode) for non-interactive output
    const proc = spawn('claude', ['-p'], {
      shell: true,
      env: { ...process.env, NO_COLOR: '1' }
    });

    // Write prompt to stdin
    proc.stdin.write(prompt);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Set timeout
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('Claude Code timed out'));
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Claude Code exited with code ${code}: ${error}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Alternative: Use Claude API directly if API key is available
 */
async function analyzeWithAPI(prompt, content) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
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
        messages: [{ role: 'user', content: prompt + '\n\n' + content }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.content[0].text;
  } catch (e) {
    return null;
  }
}

/**
 * Main analysis function - tries API first, falls back to Claude Code print mode
 */
async function analyze(promptTemplate, conversationSummary, options = {}) {
  const fullPrompt = `${promptTemplate}

${conversationSummary}

Please provide your analysis in markdown format.`;

  // Try API first if key is available (faster, no subprocess overhead)
  const apiResult = await analyzeWithAPI(promptTemplate, conversationSummary);
  if (apiResult) {
    console.log('  → Using API mode');
    return apiResult;
  }

  // Fall back to Claude Code print mode (uses your subscription)
  console.log('  → Using Claude Code print mode...');
  return await analyzeWithClaudeCode(fullPrompt, options);
}

module.exports = { analyze, analyzeWithClaudeCode, analyzeWithAPI };

// CLI test
if (require.main === module) {
  const testPrompt = 'Say "Hello from Claude Code headless mode!" and nothing else.';

  analyzeWithClaudeCode(testPrompt)
    .then(result => {
      console.log('Success:', result);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
