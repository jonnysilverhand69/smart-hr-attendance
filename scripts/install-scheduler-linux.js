#!/usr/bin/env node

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectPath = join(__dirname, '..');
const username = execSync('whoami').toString().trim();

// Load environment variables from .env to get configured times
dotenv.config({ path: join(projectPath, '.env') });

// Parse login and logout times from .env (format: HH:MM in IST)
const loginTime = (process.env.LOGIN_TIME || '09:30').split(':');
const logoutTime = (process.env.LOGOUT_TIME || '19:30').split(':');
const loginHourIST = parseInt(loginTime[0]);
const loginMinuteIST = parseInt(loginTime[1]);
const logoutHourIST = parseInt(logoutTime[0]);
const logoutMinuteIST = parseInt(logoutTime[1]);

// Convert IST to local system timezone
// Linux cron runs in system timezone, so we need to detect it
const timezone = process.env.TZ || 'Asia/Kolkata';

// For simplicity, we'll use the IST times and adjust -5 minutes for random delay
const adjustedLoginHour = loginMinuteIST >= 5 ? loginHourIST : (loginHourIST === 0 ? 23 : loginHourIST - 1);
const adjustedLoginMinute = loginMinuteIST >= 5 ? loginMinuteIST - 5 : 60 + loginMinuteIST - 5;
const adjustedLogoutHour = logoutMinuteIST >= 5 ? logoutHourIST : (logoutHourIST === 0 ? 23 : logoutHourIST - 1);
const adjustedLogoutMinute = logoutMinuteIST >= 5 ? logoutMinuteIST - 5 : 60 + logoutMinuteIST - 5;

// Get node path
let nodePath = '/usr/bin/node';
try {
  nodePath = execSync('which node').toString().trim();
} catch (err) {
  // Default to /usr/bin/node
}

// Create logs directory
mkdirSync(join(projectPath, 'logs'), { recursive: true });

// Create crontab entries
const crontabEntries = `
# HR Attendance Automation (generated from .env)
# Timezone: ${timezone}
# Login at ${process.env.LOGIN_TIME} (±5 min random) Monday-Saturday
${adjustedLoginMinute} ${adjustedLoginHour} * * 1-6 cd ${projectPath} && ${nodePath} scripts/login.js >> ${projectPath}/logs/login.log 2>&1

# Logout at ${process.env.LOGOUT_TIME} (±5 min random) Monday-Saturday
${adjustedLogoutMinute} ${adjustedLogoutHour} * * 1-6 cd ${projectPath} && ${nodePath} scripts/logout.js >> ${projectPath}/logs/logout.log 2>&1
`;

console.log('📝 Installing Linux cron scheduler...\n');

try {
  // Get current crontab (if exists)
  let currentCrontab = '';
  try {
    currentCrontab = execSync('crontab -l 2>/dev/null || true').toString();
  } catch (err) {
    // No crontab exists yet
  }

  // Remove old HR Automation entries if they exist
  const lines = currentCrontab.split('\n');
  const filteredLines = [];
  let skipUntilBlank = false;

  for (const line of lines) {
    if (line.includes('# HR Attendance Automation')) {
      skipUntilBlank = true;
      continue;
    }
    if (skipUntilBlank && line.trim() === '') {
      skipUntilBlank = false;
      continue;
    }
    if (!skipUntilBlank) {
      filteredLines.push(line);
    }
  }

  // Add new entries
  const newCrontab = filteredLines.join('\n').trim() + crontabEntries;

  // Write to temp file
  const tempCrontab = '/tmp/hr-automation-crontab';
  writeFileSync(tempCrontab, newCrontab);

  // Install new crontab
  execSync(`crontab ${tempCrontab}`);

  console.log('✅ Cron scheduler installed successfully!\n');
  console.log('📅 Schedule (from .env):');
  console.log(`   • Target Login Time: ${process.env.LOGIN_TIME} (±5 min random)`);
  console.log(`   • Target Logout Time: ${process.env.LOGOUT_TIME} (±5 min random)`);
  console.log(`   • Scheduler runs 5 min before to allow for random delay`);
  console.log(`   • Work Days: Monday - Saturday (Sundays skipped automatically)`);
  console.log(`   • Timezone: ${timezone}\n`);

  console.log('📊 To check status:');
  console.log('   crontab -l | grep "HR Attendance"\n');

  console.log('📝 Logs will be saved to:');
  console.log(`   ${projectPath}/logs/\n`);

  console.log('🛑 To uninstall:');
  console.log('   npm run uninstall:scheduler\n');

  console.log('✨ Installation complete!\n');
} catch (error) {
  console.error('❌ Failed to install cron scheduler:', error.message);
  console.log('\n💡 Manual installation:');
  console.log('   1. Run: crontab -e');
  console.log('   2. Add these lines:');
  console.log(crontabEntries);
  process.exit(1);
}
