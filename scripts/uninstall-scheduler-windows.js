#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🗑️  Removing HR Attendance Task Scheduler tasks...\n');

try {
  // Delete login task
  console.log('📋 Removing login task...');
  try {
    execSync('schtasks /Delete /TN "HRAutomation_Login" /F', { stdio: 'pipe' });
    console.log('✅ Login task removed');
  } catch (err) {
    console.log('ℹ️  Login task not found');
  }

  // Delete logout task
  console.log('\n📋 Removing logout task...');
  try {
    execSync('schtasks /Delete /TN "HRAutomation_Logout" /F', { stdio: 'pipe' });
    console.log('✅ Logout task removed');
  } catch (err) {
    console.log('ℹ️  Logout task not found');
  }

  console.log('\n✨ Uninstallation complete!\n');
  console.log('📊 To verify:');
  console.log('   schtasks /Query /FO LIST | findstr "HRAutomation"\n');

} catch (error) {
  console.error('❌ Failed to remove tasks:', error.message);
  console.log('\n💡 Manual uninstallation:');
  console.log('   1. Open Task Scheduler');
  console.log('   2. Delete "HRAutomation_Login" task');
  console.log('   3. Delete "HRAutomation_Logout" task\n');
  process.exit(1);
}
