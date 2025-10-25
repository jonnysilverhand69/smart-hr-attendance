#!/usr/bin/env node

import { platform } from 'os';
import chalk from 'chalk';

const currentPlatform = platform();

console.log(chalk.bold.cyan('\n🔍 Detecting platform...\n'));
console.log(`Platform: ${chalk.yellow(currentPlatform)}`);

// Route to appropriate uninstaller based on platform
if (currentPlatform === 'darwin') {
  console.log(chalk.green('✅ macOS detected - Removing launchd jobs\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/uninstall-scheduler-macos.js', { stdio: 'inherit' });
} else if (currentPlatform === 'linux') {
  console.log(chalk.green('✅ Linux detected - Removing cron jobs\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/uninstall-scheduler-linux.js', { stdio: 'inherit' });
} else if (currentPlatform === 'win32') {
  console.log(chalk.green('✅ Windows detected - Removing Task Scheduler tasks\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/uninstall-scheduler-windows.js', { stdio: 'inherit' });
} else {
  console.log(chalk.red(`\n❌ Unsupported platform: ${currentPlatform}\n`));
  process.exit(1);
}
