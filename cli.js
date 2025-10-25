#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { ConfigManager } from './src/config.js';
import { Scheduler } from './src/scheduler.js';
import { showSplash, getRandomFact } from './src/splash.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();
const config = new ConfigManager();

// CLI header
function showHeader() {
  showSplash(); // Show epic ASCII art with random FUCK HCL message
}

// Setup wizard
async function setupWizard() {
  showHeader();

  console.log(chalk.bold.yellow('\n🚀 Interactive Setup Wizard\n'));

  // First, ask deployment preference
  const deploymentChoice = await inquirer.prompt([
    {
      type: 'list',
      name: 'deploymentType',
      message: '🚀 How do you want to deploy this?',
      choices: [
        { name: '⚡ GitHub Actions - Fork & enable (100% FREE!)', value: 'github-actions' },
        { name: '☁️  Cloud (Railway/Render) - Easiest for VPS', value: 'cloud' },
        { name: '🐳 Docker - Local or VPS with Docker', value: 'docker' },
        { name: '💻 Local - Windows/Linux/macOS scheduler', value: 'local' }
      ],
      default: 'github-actions'
    }
  ]);

  console.log('\n' + chalk.cyan('━'.repeat(60)));
  console.log(chalk.italic.gray(getRandomFact()));
  console.log(chalk.cyan('━'.repeat(60)) + '\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'profileName',
      message: 'Profile name:',
      default: 'default',
      validate: (input) => {
        if (!input.trim()) return 'Profile name is required';
        return true;
      }
    },
    {
      type: 'input',
      name: 'username',
      message: 'HR Portal Username (email):',
      validate: (input) => {
        if (!input.trim()) return 'Username is required';
        if (!input.includes('@')) return 'Please enter a valid email';
        return true;
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'HR Portal Password:',
      mask: '*',
      validate: (input) => {
        if (!input.trim()) return 'Password is required';
        return true;
      }
    },
    {
      type: 'input',
      name: 'url',
      message: 'HR Portal URL:',
      default: 'https://hr-erp.shivnadarfoundation.org/Adrenalin/'
    },
    {
      type: 'input',
      name: 'loginTime',
      message: 'Login time (HH:MM format):',
      default: '09:30',
      validate: (input) => {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!regex.test(input)) return 'Invalid time format. Use HH:MM (e.g., 09:30)';
        return true;
      }
    },
    {
      type: 'input',
      name: 'logoutTime',
      message: 'Logout time (HH:MM format):',
      default: '19:30',
      validate: (input) => {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!regex.test(input)) return 'Invalid time format. Use HH:MM (e.g., 19:30)';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'enableNotifications',
      message: 'Enable notifications?',
      default: true
    }
  ]);

  let googleChatWebhook = '';
  let discordWebhook = '';

  if (answers.enableNotifications) {
    const notificationAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableGoogleChat',
        message: 'Enable Google Chat notifications?',
        default: true
      },
      {
        type: 'input',
        name: 'googleChatWebhook',
        message: 'Google Chat Webhook URL:',
        when: (ans) => ans.enableGoogleChat,
        validate: (input) => {
          if (!input.trim()) return 'Webhook URL is required';
          if (!input.startsWith('https://')) return 'Please enter a valid HTTPS URL';
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'enableDiscord',
        message: 'Enable Discord notifications?',
        default: false
      },
      {
        type: 'input',
        name: 'discordWebhook',
        message: 'Discord Webhook URL:',
        when: (ans) => ans.enableDiscord,
        validate: (input) => {
          if (!input.trim()) return 'Webhook URL is required';
          if (!input.startsWith('https://')) return 'Please enter a valid HTTPS URL';
          return true;
        }
      }
    ]);

    googleChatWebhook = notificationAnswers.googleChatWebhook || '';
    discordWebhook = notificationAnswers.discordWebhook || '';
  }

  const funMessages = [
    'Liberating you from corporate slavery...',
    'Teaching HCL who\'s boss...',
    'Automating your way to freedom...',
    'Breaking the chains of manual attendance...',
    'Saving your sanity, one config at a time...',
    'Making corporate bureaucracy obsolete...'
  ];
  const spinner = ora(funMessages[Math.floor(Math.random() * funMessages.length)]).start();

  try {
    // Create profile configuration
    const profileConfig = {
      username: answers.username,
      password: answers.password,
      url: answers.url,
      schedule: {
        loginTime: answers.loginTime,
        logoutTime: answers.logoutTime,
        workDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
        randomDelay: 5
      },
      notifications: {
        enabled: answers.enableNotifications,
        googleChat: {
          enabled: !!googleChatWebhook,
          webhook: googleChatWebhook
        },
        discord: {
          enabled: !!discordWebhook,
          webhook: discordWebhook
        }
      },
      options: {
        headless: true,
        screenshots: true,
        retries: 3
      }
    };

    // Save profile
    config.addProfile(answers.profileName, profileConfig);

    // Export to .env for standalone usage
    const envContent = config.exportToEnv(answers.profileName);
    writeFileSync(join(__dirname, '.env'), envContent);

    // Generate crontab for Docker deployment with configured times
    try {
      const { execSync } = await import('child_process');
      execSync('node scripts/generate-crontab.js', { cwd: __dirname, stdio: 'pipe' });
    } catch (error) {
      // Silently continue if crontab generation fails
    }

    spinner.succeed('Configuration saved!');

    console.log('\n' + chalk.bold.green('✅ Setup Complete!\n'));
    console.log(chalk.bold('Profile Details:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`${chalk.cyan('Profile:')} ${answers.profileName}`);
    console.log(`${chalk.cyan('Username:')} ${answers.username}`);
    console.log(`${chalk.cyan('Login Time:')} ${answers.loginTime} (±5 min random)`);
    console.log(`${chalk.cyan('Logout Time:')} ${answers.logoutTime} (±5 min random)`);
    console.log(`${chalk.cyan('Work Days:')} Monday - Saturday`);
    console.log(`${chalk.cyan('Notifications:')} ${answers.enableNotifications ? 'Enabled' : 'Disabled'}`);
    if (googleChatWebhook) console.log(`  ${chalk.gray('• Google Chat: Enabled')}`);
    if (discordWebhook) console.log(`  ${chalk.gray('• Discord: Enabled')}`);
    console.log(chalk.gray('─'.repeat(50)));

    // Auto-deploy based on choice
    console.log('\n' + chalk.bold.yellow('📋 Deployment Instructions:\n'));

    if (deploymentChoice.deploymentType === 'github-actions') {
      await handleGitHubActionsDeployment(answers);
    } else if (deploymentChoice.deploymentType === 'cloud') {
      await handleCloudDeployment(answers);
    } else if (deploymentChoice.deploymentType === 'docker') {
      await handleDockerDeployment();
    } else if (deploymentChoice.deploymentType === 'local') {
      await handleLocalDeployment();
    }
  } catch (error) {
    spinner.fail('Setup failed!');
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Handle GitHub Actions deployment
async function handleGitHubActionsDeployment(answers) {
  console.log(boxen(
    chalk.bold.cyan('⚡ GitHub Actions Deployment') + '\n' +
    chalk.green('100% FREE - No credit card needed!') + '\n\n' +
    chalk.white('Follow these steps:\n\n') +
    chalk.yellow('1. Fork this repository') + '\n' +
    chalk.gray('   • Click "Fork" button on GitHub\n\n') +
    chalk.yellow('2. Enable GitHub Actions') + '\n' +
    chalk.gray('   • Go to your fork → Actions tab\n') +
    chalk.gray('   • Click "I understand, enable them"\n\n') +
    chalk.yellow('3. Add Repository Secrets') + '\n' +
    chalk.gray('   • Go to Settings → Secrets → Actions\n') +
    chalk.gray('   • Click "New repository secret"\n') +
    chalk.gray('   • Add these secrets:\n\n') +
    chalk.cyan('Required Secrets:') + '\n' +
    chalk.gray(`   HR_USERNAME = ${answers.username}\n`) +
    chalk.gray(`   HR_PASSWORD = ${answers.password}\n`) +
    chalk.gray(`   HR_URL = ${answers.url}\n\n`) +
    chalk.cyan('Optional Secrets:') + '\n' +
    chalk.gray(`   LOGIN_TIME = ${answers.loginTime}\n`) +
    chalk.gray(`   LOGOUT_TIME = ${answers.logoutTime}\n`) +
    chalk.gray(`   DISCORD_WEBHOOK = ${answers.discordWebhook || '(if you have one)'}\n`) +
    chalk.gray(`   GOOGLE_CHAT_WEBHOOK = ${answers.googleChatWebhook || '(if you have one)'}\n\n`) +
    chalk.yellow('4. Done!') + '\n' +
    chalk.gray('   • Workflow runs automatically\n') +
    chalk.gray('   • Login: 9:25 AM IST (Mon-Sat)\n') +
    chalk.gray('   • Logout: 7:25 PM IST (Mon-Sat)\n') +
    chalk.gray('   • Check Actions tab for status\n\n') +
    chalk.green('✅ Completely FREE forever!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'green'
    }
  ));

  console.log('\n' + chalk.bold.magenta('💡 Pro Tips:\n'));
  console.log(chalk.cyan('• Test manually:') + ' Go to Actions → Run workflow');
  console.log(chalk.cyan('• View logs:') + ' Actions tab → Click on workflow run');
  console.log(chalk.cyan('• Download screenshots:') + ' Available in failed runs\n');

  console.log(chalk.bold.magenta('🎉 SHARE THIS REPO:\n'));
  console.log(chalk.gray('Help others discover GitHub Actions deployment!\n'));
  console.log(chalk.cyan('Tweet:') + ' "Just set up FREE HR automation with GitHub Actions! 🎉"');
  console.log(chalk.cyan('Star:') + ' ⭐ Help it go viral!');
  console.log(chalk.cyan('Share:') + ' Send the repo to colleagues\n');
}

// Handle cloud deployment
async function handleCloudDeployment(answers) {
  console.log(boxen(
    chalk.bold.cyan('☁️  Cloud Deployment') + '\n\n' +
    chalk.white('Choose your preferred platform:\n\n') +
    chalk.yellow('1. Railway (Recommended)') + '\n' +
    chalk.gray('   • Visit: https://railway.app\n') +
    chalk.gray('   • Click: New Project → Deploy from GitHub\n') +
    chalk.gray('   • Add your .env variables\n') +
    chalk.gray('   • Cost: $5/month\n\n') +
    chalk.yellow('2. Render.com') + '\n' +
    chalk.gray('   • Visit: https://render.com\n') +
    chalk.gray('   • New+ → Background Worker\n') +
    chalk.gray('   • Connect GitHub → Add env vars\n') +
    chalk.gray('   • Cost: $7/month\n\n') +
    chalk.yellow('3. Fly.io (Cheapest)') + '\n' +
    chalk.gray('   • Run: fly launch\n') +
    chalk.gray('   • Cost: ~$3/month\n\n') +
    chalk.green('✅ Your .env file is ready!') + '\n' +
    chalk.gray('Copy the variables when deploying'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    }
  ));

  console.log('\n' + chalk.bold.magenta('🎉 SHARE THIS PROJECT:\n'));
  console.log(chalk.gray('Help others automate their attendance too!\n'));
  console.log(chalk.cyan('Tweet:') + ' "Just automated my HR attendance with this epic tool! 🚀"');
  console.log(chalk.cyan('Star on GitHub:') + ' ⭐ (Help it go viral!)');
  console.log(chalk.cyan('Share with colleagues:') + ' Send them the repo link\n');
}

// Handle Docker deployment
async function handleDockerDeployment() {
  const spinner = ora('Checking Docker installation...').start();

  try {
    const { execSync } = await import('child_process');
    execSync('docker --version', { stdio: 'pipe' });
    spinner.succeed('Docker is installed!');

    const deployChoice = await inquirer.prompt([{
      type: 'confirm',
      name: 'deployNow',
      message: '🐳 Start Docker container now?',
      default: true
    }]);

    if (deployChoice.deployNow) {
      const deploySpinner = ora('Starting Docker container...').start();
      try {
        execSync('docker-compose up -d', { cwd: __dirname });
        deploySpinner.succeed('Docker container started!');

        console.log('\n' + chalk.bold.green('✅ Deployment Complete!\n'));
        console.log(chalk.cyan('View logs:') + ' docker-compose logs -f');
        console.log(chalk.cyan('Stop:') + ' docker-compose down');
        console.log(chalk.cyan('Restart:') + ' docker-compose restart\n');

        console.log(chalk.bold.magenta('🎉 Your attendance is now automated!\n'));
        console.log(chalk.gray('⭐ Star this project on GitHub if it helped you!'));
        console.log(chalk.gray('💬 Share with your colleagues!\n'));
      } catch (error) {
        deploySpinner.fail('Docker deployment failed');
        console.log(chalk.yellow('\nManual command:') + ' docker-compose up -d\n');
      }
    } else {
      console.log('\n' + chalk.cyan('Run manually:') + ' docker-compose up -d\n');
    }
  } catch (error) {
    spinner.fail('Docker not found!');
    console.log('\n' + chalk.yellow('Install Docker:'));
    console.log(chalk.gray('https://www.docker.com/get-started\n'));
  }
}

// Handle local deployment (all platforms)
async function handleLocalDeployment() {
  const platform = process.platform;
  let platformName = 'Unknown';
  let checkCommand = '';

  if (platform === 'darwin') {
    platformName = 'macOS (launchd)';
    checkCommand = 'launchctl list | grep hrautomation';
  } else if (platform === 'linux') {
    platformName = 'Linux (cron)';
    checkCommand = 'crontab -l | grep "HR Attendance"';
  } else if (platform === 'win32') {
    platformName = 'Windows (Task Scheduler)';
    checkCommand = 'schtasks /Query /TN "HRAutomation_Login"';
  }

  const installChoice = await inquirer.prompt([{
    type: 'confirm',
    name: 'installNow',
    message: `💻 Install ${platformName} scheduler now?`,
    default: true
  }]);

  if (installChoice.installNow) {
    const spinner = ora(`Installing ${platformName} scheduler...`).start();
    try {
      const { execSync } = await import('child_process');
      execSync('node scripts/install-scheduler-universal.js', { cwd: __dirname, stdio: 'pipe' });
      spinner.succeed('Scheduler installed!');

      console.log('\n' + chalk.bold.green('✅ Installation Complete!\n'));
      console.log(chalk.cyan('Check status:') + ` ${checkCommand}`);
      console.log(chalk.cyan('View logs:') + ` tail -f logs/login.log`);
      console.log(chalk.cyan('Uninstall:') + ' npm run uninstall:scheduler\n');

      console.log(chalk.bold.magenta('🎉 Your attendance is now automated!\n'));
      console.log(chalk.gray('⭐ Don\'t forget to star this on GitHub!'));
      console.log(chalk.gray('💬 Share the repo with friends!\n'));
    } catch (error) {
      spinner.fail('Installation failed');
      console.log(chalk.yellow('\nManual command:') + ' npm run install:scheduler\n');
      console.log(chalk.gray('Error:'), error.message);
    }
  } else {
    console.log('\n' + chalk.cyan('Run manually:') + ' npm run install:scheduler\n');
  }
}

// Status dashboard
async function showStatus() {
  showHeader();

  console.log(chalk.bold.yellow('\n📊 System Status\n'));

  const profiles = config.getAllProfiles();
  const profileNames = Object.keys(profiles);

  if (profileNames.length === 0) {
    console.log(chalk.red('No profiles configured.'));
    console.log(chalk.gray('Run: npm run setup\n'));
    return;
  }

  profileNames.forEach((name) => {
    const profile = profiles[name];
    const scheduler = new Scheduler(profile.schedule);
    const summary = scheduler.getSummary();

    console.log(
      boxen(
        chalk.bold(`Profile: ${name}`) +
          (profile.isDefault ? chalk.green(' [DEFAULT]') : '') +
          '\n' +
          chalk.gray('─'.repeat(40)) +
          '\n' +
          `${chalk.cyan('Username:')} ${profile.username}\n` +
          `${chalk.cyan('Status:')} ${summary.isWorkDay ? chalk.green('Active') : chalk.yellow('Off Day')}\n` +
          `${chalk.cyan('Login Time:')} ${profile.schedule.loginTime} ${chalk.gray('(±5 min)')}\n` +
          `${chalk.cyan('Logout Time:')} ${profile.schedule.logoutTime} ${chalk.gray('(±5 min)')}\n` +
          `${chalk.cyan('Work Days:')} ${summary.workDays.join(', ')}\n` +
          `${chalk.cyan('Notifications:')} ${profile.notifications.enabled ? chalk.green('Enabled') : chalk.red('Disabled')}\n` +
          (profile.notifications.googleChat?.enabled ? chalk.gray('  • Google Chat ✓') + '\n' : '') +
          (profile.notifications.discord?.enabled ? chalk.gray('  • Discord ✓') + '\n' : '') +
          chalk.gray('─'.repeat(40)) +
          '\n' +
          `${chalk.cyan('Next Work Day:')} ${summary.nextWorkDay}`,
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: summary.isWorkDay ? 'green' : 'yellow'
        }
      )
    );
  });

  console.log();
}

// List profiles
async function listProfiles() {
  showHeader();

  const profiles = config.getAllProfiles();
  const profileNames = Object.keys(profiles);

  if (profileNames.length === 0) {
    console.log(chalk.red('\nNo profiles found.'));
    console.log(chalk.gray('Run: npm run setup\n'));
    return;
  }

  console.log(chalk.bold.yellow(`\n📋 Configured Profiles (${profileNames.length})\n`));

  profileNames.forEach((name, index) => {
    const profile = profiles[name];
    const icon = profile.isDefault ? chalk.green('★') : chalk.gray('○');
    console.log(`${icon} ${chalk.bold(name)} - ${profile.username} ${profile.isDefault ? chalk.green('[DEFAULT]') : ''}`);
  });

  console.log();
}

// Add profile
async function addProfile() {
  await setupWizard();
}

// Delete profile
async function deleteProfile(profileName) {
  const spinner = ora(`Deleting profile: ${profileName}`).start();

  if (config.deleteProfile(profileName)) {
    spinner.succeed(`Profile "${profileName}" deleted!`);
  } else {
    spinner.fail(`Profile "${profileName}" not found!`);
  }
}

// CLI Commands
program
  .name('hr-attendance')
  .description('Enterprise HR Attendance Automation CLI')
  .version('1.0.0');

program
  .command('setup')
  .description('Interactive setup wizard')
  .action(setupWizard);

program
  .command('status')
  .description('Show system status and schedule')
  .action(showStatus);

program
  .command('list')
  .description('List all configured profiles')
  .action(listProfiles);

program
  .command('add')
  .description('Add a new profile')
  .action(addProfile);

program
  .command('delete <profileName>')
  .description('Delete a profile')
  .action(deleteProfile);

// Parse CLI arguments
program.parse();
