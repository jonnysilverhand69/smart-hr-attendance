#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🗑️  Removing HR Attendance cron jobs...\n');

try {
  // Get current crontab
  let currentCrontab = '';
  try {
    currentCrontab = execSync('crontab -l 2>/dev/null || true').toString();
  } catch (err) {
    console.log('ℹ️  No crontab found');
    process.exit(0);
  }

  // Remove HR Automation entries
  const lines = currentCrontab.split('\n');
  const filteredLines = [];
  let skipUntilBlank = false;

  for (const line of lines) {
    if (line.includes('# HR Attendance Automation')) {
      skipUntilBlank = true;
      continue;
    }
    if (skipUntilBlank) {
      if (line.trim() === '' || !line.includes('scripts/login.js') && !line.includes('scripts/logout.js')) {
        skipUntilBlank = false;
      }
      if (skipUntilBlank) continue;
    }
    if (line.trim() !== '') {
      filteredLines.push(line);
    }
  }

  // Install cleaned crontab
  const newCrontab = filteredLines.join('\n');
  const tempCrontab = '/tmp/hr-automation-crontab-clean';
  writeFileSync(tempCrontab, newCrontab);

  execSync(`crontab ${tempCrontab}`);

  console.log('✅ HR Attendance cron jobs removed successfully!\n');
  console.log('📊 To verify:');
  console.log('   crontab -l\n');

} catch (error) {
  console.error('❌ Failed to remove cron jobs:', error.message);
  console.log('\n💡 Manual uninstallation:');
  console.log('   1. Run: crontab -e');
  console.log('   2. Delete lines containing "HR Attendance Automation"\n');
  process.exit(1);
}
