#!/usr/bin/env node

/**
 * Smart Attendance Recovery System
 * Checks if login/logout was missed and runs them if needed
 *
 * Use Cases:
 * 1. Laptop was off during scheduled time
 * 2. Laptop booted late (e.g., 11 AM instead of 9 AM)
 * 3. System crashed/restarted
 * 4. Scheduler failed to run
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectPath = join(__dirname, '..');

// Load environment
dotenv.config({ path: join(projectPath, '.env') });

const stateFile = join(projectPath, '.config', 'state.json');
const now = new Date();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();
const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.

// Parse configured times
const [loginHour, loginMinute] = (process.env.LOGIN_TIME || '09:30').split(':').map(Number);
const [logoutHour, logoutMinute] = (process.env.LOGOUT_TIME || '19:30').split(':').map(Number);

console.log('🔍 Checking for missed attendance...\n');
console.log(`📅 Current time: ${now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
console.log(`📅 Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay]}\n`);

// Skip if Sunday
if (currentDay === 0) {
  console.log('⏸️  Sunday - No attendance required');
  process.exit(0);
}

// Check login state
let needsLogin = false;
let needsLogout = false;
let lastLogin = null;

try {
  if (existsSync(stateFile)) {
    const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    if (state.lastLogin) {
      lastLogin = new Date(state.lastLogin);
      const lastLoginDate = lastLogin.toDateString();
      const todayDate = now.toDateString();

      // Check if we already logged in today
      if (lastLoginDate === todayDate) {
        console.log(`✅ Already logged in today at ${lastLogin.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
      } else {
        console.log(`⚠️  Last login was ${lastLoginDate} (not today)`);
        needsLogin = true;
      }
    } else {
      console.log('⚠️  No login record found');
      needsLogin = true;
    }
  } else {
    console.log('⚠️  No state file found - first run?');
    needsLogin = true;
  }
} catch (error) {
  console.log('⚠️  Could not read state file:', error.message);
  needsLogin = true;
}

// Determine what action to take based on actual login time (not fixed schedule)
const currentTimeMinutes = currentHour * 60 + currentMinute;
const scheduledLoginMinutes = loginHour * 60 + loginMinute;
const scheduledLogoutMinutes = logoutHour * 60 + logoutMinute;

const REQUIRED_WORK_HOURS = 10; // 10 hours minimum
const REQUIRED_WORK_MS = REQUIRED_WORK_HOURS * 60 * 60 * 1000;

console.log('\n📊 Time Analysis:');
console.log(`   Scheduled Login: ${process.env.LOGIN_TIME}`);
console.log(`   Scheduled Logout: ${process.env.LOGOUT_TIME}`);
console.log(`   Current Time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);

if (lastLogin) {
  const hoursWorked = (now - lastLogin) / (1000 * 60 * 60);
  const targetLogoutTime = new Date(lastLogin.getTime() + REQUIRED_WORK_MS);
  console.log(`   Actual Login: ${lastLogin.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`);
  console.log(`   Hours Worked: ${hoursWorked.toFixed(1)} hours`);
  console.log(`   Target Logout (10h): ${targetLogoutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`);
}
console.log();

// Scenario 1: Before scheduled login time AND no login yet - wait
if (currentTimeMinutes < scheduledLoginMinutes && needsLogin) {
  console.log('ℹ️  Too early - waiting for scheduled login time');
  process.exit(0);
}

// Scenario 2: Past scheduled login time but no login yet - MISSED LOGIN
if (currentTimeMinutes >= scheduledLoginMinutes && needsLogin) {
  // Only auto-login if it's the same day and before midnight
  const hoursSinceScheduled = (currentTimeMinutes - scheduledLoginMinutes) / 60;

  if (hoursSinceScheduled > 12) {
    console.log('🚨 CRITICAL: Missed login by more than 12 hours');
    console.log('   Too late to auto-recover - manual intervention needed\n');
    process.exit(1);
  }

  console.log('🚨 MISSED LOGIN DETECTED!');
  console.log(`   Scheduled for: ${process.env.LOGIN_TIME}`);
  console.log(`   Missed by: ${hoursSinceScheduled.toFixed(1)} hours`);
  console.log('   Running login NOW to recover...\n');

  try {
    console.log('🔄 Executing login script...');
    execSync('node scripts/login.js', {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 120000
    });
    console.log('\n✅ Recovery login completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Recovery login failed:', error.message);
    process.exit(1);
  }
}

// Scenario 3: Already logged in - check if we should logout
if (lastLogin && lastLogin.toDateString() === now.toDateString()) {
  const hoursWorked = (now - lastLogin) / (1000 * 60 * 60);

  // Calculate end of day (11:59 PM same day)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Calculate ideal 10-hour logout time
  const idealLogoutTime = new Date(lastLogin.getTime() + REQUIRED_WORK_MS);

  // Calculate max possible hours before midnight
  const maxPossibleHours = (endOfDay - lastLogin) / (1000 * 60 * 60);

  // Actual target is the earlier of: 10 hours OR end of day
  const targetLogoutTime = idealLogoutTime <= endOfDay ? idealLogoutTime : endOfDay;
  const targetHours = Math.min(REQUIRED_WORK_HOURS, maxPossibleHours);

  console.log('✅ Login already completed today\n');

  // If login was too late to complete 10 hours today
  if (maxPossibleHours < REQUIRED_WORK_HOURS) {
    console.log(`⚠️  Late login detected!`);
    console.log(`   Logged in: ${lastLogin.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`);
    console.log(`   Max possible hours today: ${maxPossibleHours.toFixed(1)}h`);
    console.log(`   Will logout at: 11:59 PM (end of day)`);
    console.log();
  }

  // Check if it's time to logout
  if (now >= targetLogoutTime) {
    console.log('🚨 TIME TO LOGOUT!');
    console.log(`   Worked: ${hoursWorked.toFixed(1)} hours`);

    if (targetLogoutTime.getDate() === now.getDate()) {
      console.log(`   Logout time: ${targetLogoutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`);
    } else {
      console.log(`   Logout time: 11:59 PM (end of day limit)`);
    }

    console.log('   Running logout NOW...\n');

    try {
      console.log('🔄 Executing logout script...');
      execSync('node scripts/logout.js', {
        cwd: projectPath,
        stdio: 'inherit',
        timeout: 120000
      });
      console.log('\n✅ Logout completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Logout failed:', error.message);
      process.exit(1);
    }
  } else {
    const remainingHours = (targetHours - hoursWorked).toFixed(1);
    const remainingMinutes = Math.ceil((targetLogoutTime - now) / (1000 * 60));

    console.log(`📊 Work Progress:`);
    console.log(`   Worked: ${hoursWorked.toFixed(1)}h / ${targetHours.toFixed(1)}h`);
    console.log(`   Remaining: ${remainingHours}h (${remainingMinutes} min)`);
    console.log(`   Auto-logout at: ${targetLogoutTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}`);

    if (maxPossibleHours < REQUIRED_WORK_HOURS) {
      console.log(`   ⚠️  Note: Can't complete full 10h today (late start)`);
    }

    console.log('\n✅ All good - wait for logout time');
    process.exit(0);
  }
}

console.log('ℹ️  No action needed at this time');
process.exit(0);
