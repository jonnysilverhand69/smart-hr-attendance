#!/usr/bin/env node

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectPath = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectPath, '.env') });

// Parse login and logout times from .env (format: HH:MM in IST)
const loginTime = (process.env.LOGIN_TIME || '09:30').split(':');
const logoutTime = (process.env.LOGOUT_TIME || '19:30').split(':');
const loginHourIST = parseInt(loginTime[0]);
const loginMinuteIST = parseInt(loginTime[1]);
const logoutHourIST = parseInt(logoutTime[0]);
const logoutMinuteIST = parseInt(logoutTime[1]);

// Convert IST to UTC (IST = UTC + 5:30)
// Subtract 5 hours 30 minutes to get UTC
// Also subtract 5 minutes to run before target time (for random delay)
function istToUTC(hourIST, minuteIST) {
  // Subtract 5 minutes first for scheduler buffer
  let totalMinutes = hourIST * 60 + minuteIST - 5;

  // Convert IST to UTC (subtract 5:30)
  totalMinutes -= (5 * 60 + 30);

  // Handle negative minutes (previous day)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  const hourUTC = Math.floor(totalMinutes / 60) % 24;
  const minuteUTC = totalMinutes % 60;

  return { hour: hourUTC, minute: minuteUTC };
}

const loginUTC = istToUTC(loginHourIST, loginMinuteIST);
const logoutUTC = istToUTC(logoutHourIST, logoutMinuteIST);

// Generate crontab content
const crontabContent = `# HR Attendance Automation Crontab
# Generated from .env configuration
# Times are in UTC (converted from IST)

# Login at ${process.env.LOGIN_TIME} IST (${loginUTC.hour.toString().padStart(2, '0')}:${loginUTC.minute.toString().padStart(2, '0')} UTC) Monday-Saturday
# Random delay of ±5 minutes handled by scheduler
${loginUTC.minute} ${loginUTC.hour} * * 1-6 cd /app && node scripts/login.js >> /app/logs/cron.log 2>&1

# Logout at ${process.env.LOGOUT_TIME} IST (${logoutUTC.hour.toString().padStart(2, '0')}:${logoutUTC.minute.toString().padStart(2, '0')} UTC) Monday-Saturday
# Random delay of ±5 minutes handled by scheduler
${logoutUTC.minute} ${logoutUTC.hour} * * 1-6 cd /app && node scripts/logout.js >> /app/logs/cron.log 2>&1

# Keep an empty line at the end of file for cron to work properly
`;

// Write crontab file
const crontabPath = join(projectPath, 'crontab');
writeFileSync(crontabPath, crontabContent);

console.log('✅ Crontab generated successfully!');
console.log('\n📅 Schedule:');
console.log(`   • Login: ${process.env.LOGIN_TIME} IST → ${loginUTC.hour.toString().padStart(2, '0')}:${loginUTC.minute.toString().padStart(2, '0')} UTC`);
console.log(`   • Logout: ${process.env.LOGOUT_TIME} IST → ${logoutUTC.hour.toString().padStart(2, '0')}:${logoutUTC.minute.toString().padStart(2, '0')} UTC`);
console.log(`   • Work Days: Monday - Saturday`);
console.log(`\n📝 Crontab saved to: ${crontabPath}`);
