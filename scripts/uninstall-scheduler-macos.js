import { execSync } from 'child_process';
import { unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const launchAgentsPath = join(homedir(), 'Library', 'LaunchAgents');
const loginPlistPath = join(launchAgentsPath, 'com.hrautomation.login.plist');
const logoutPlistPath = join(launchAgentsPath, 'com.hrautomation.logout.plist');
const recoveryPlistPath = join(launchAgentsPath, 'com.hrautomation.recovery.plist');

console.log('🗑️  Uninstalling schedulers...');

// Unload and remove login scheduler
try {
  execSync(`launchctl unload ${loginPlistPath}`);
  unlinkSync(loginPlistPath);
  console.log('✅ Login scheduler uninstalled');
} catch (error) {
  console.log('ℹ️  Login scheduler was not installed or already removed');
}

// Unload and remove logout scheduler
try {
  execSync(`launchctl unload ${logoutPlistPath}`);
  unlinkSync(logoutPlistPath);
  console.log('✅ Logout scheduler uninstalled');
} catch (error) {
  console.log('ℹ️  Logout scheduler was not installed or already removed');
}

// Unload and remove recovery checker
try {
  execSync(`launchctl unload ${recoveryPlistPath}`);
  unlinkSync(recoveryPlistPath);
  console.log('✅ Recovery checker uninstalled');
} catch (error) {
  console.log('ℹ️  Recovery checker was not installed or already removed');
}

console.log('\n✨ Uninstallation complete!');
