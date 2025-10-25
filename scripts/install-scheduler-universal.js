#!/usr/bin/env node

import { platform } from 'os';
import chalk from 'chalk';

const currentPlatform = platform();

console.log(chalk.bold.cyan('\n🔍 Detecting platform...\n'));
console.log(`Platform: ${chalk.yellow(currentPlatform)}`);

// Route to appropriate installer based on platform
if (currentPlatform === 'darwin') {
  console.log(chalk.green('✅ macOS detected - Using launchd\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/install-scheduler-macos.js', { stdio: 'inherit' });
} else if (currentPlatform === 'linux') {
  console.log(chalk.green('✅ Linux detected - Using cron\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/install-scheduler-linux.js', { stdio: 'inherit' });
} else if (currentPlatform === 'win32') {
  console.log(chalk.green('✅ Windows detected - Using Task Scheduler\n'));
  const { execSync } = await import('child_process');
  execSync('node scripts/install-scheduler-windows.js', { stdio: 'inherit' });
} else {
  console.log(chalk.red(`\n❌ Unsupported platform: ${currentPlatform}\n`));
  console.log(chalk.yellow('Supported platforms:'));
  console.log(chalk.gray('  • macOS (darwin)'));
  console.log(chalk.gray('  • Linux'));
  console.log(chalk.gray('  • Windows (win32)\n'));
  console.log(chalk.cyan('Alternative: Use Docker deployment instead'));
  console.log(chalk.gray('  docker-compose up -d\n'));
  process.exit(1);
}
