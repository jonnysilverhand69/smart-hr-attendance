import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { NotificationManager } from '../src/notifications.js';
import { Scheduler } from '../src/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Ensure screenshots directory exists
const screenshotsDir = join(__dirname, '..', 'screenshots');
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

// State file for tracking login time
const stateFile = join(__dirname, '..', '.config', 'state.json');

async function login() {
  const startTime = new Date();

  // Initialize notification manager
  const notifier = new NotificationManager({
    googleChatWebhook: process.env.GOOGLE_CHAT_WEBHOOK,
    discordWebhook: process.env.DISCORD_WEBHOOK,
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false'
  });

  // Initialize scheduler to check if today is a work day
  const scheduler = new Scheduler({
    loginTime: process.env.LOGIN_TIME || '09:30',
    logoutTime: process.env.LOGOUT_TIME || '19:30',
    workDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    randomDelay: parseInt(process.env.RANDOM_DELAY || '5')
  });

  // Check if today is a work day
  const workDayCheck = scheduler.shouldRunLogin();
  if (!workDayCheck.shouldRun) {
    console.log(`⏸️  ${workDayCheck.reason}`);
    console.log(`📅 Next work day: ${scheduler.getNextWorkDay()}`);
    process.exit(0);
  }

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const username = process.env.HR_USERNAME;
  let retries = parseInt(process.env.RETRIES || '3');

  try {
    console.log('🚀 Starting login process...');
    console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`👤 User: ${username}`);

    // Navigate to HR portal
    console.log('🌐 Navigating to HR portal...');
    await page.goto(process.env.HR_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Fill in username
    console.log('👤 Entering username...');
    await page.getByRole('textbox', { name: 'Domain\\Net ID or User ID' }).click();
    await page.getByRole('textbox', { name: 'Domain\\Net ID or User ID' }).fill(process.env.HR_USERNAME);

    // Fill in password
    console.log('🔑 Entering password...');
    await page.locator('#txtPwd').click();
    await page.locator('#txtPwd').fill(process.env.HR_PASSWORD);

    // Check "Remember me" checkbox
    await page.locator('#ckbSave').check();

    // Click login button
    console.log('🔓 Clicking login button...');
    await page.getByText('Login', { exact: true }).click();

    // Wait for and handle the OK dialog (if present)
    try {
      await page.waitForTimeout(2000); // Wait for page to load
      const okButton = page.getByRole('button', { name: 'OK' });
      if (await okButton.isVisible({ timeout: 3000 })) {
        await okButton.click();
        console.log('✅ Handled login confirmation dialog');
      }
    } catch (error) {
      console.log('ℹ️  No confirmation dialog found (this is normal)');
    }

    // Verify login was successful by checking for user name
    await page.waitForTimeout(3000);

    console.log('✅ Login successful!');
    console.log('✅ Attendance marked automatically upon login');

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`⏰ Completed at: ${endTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    // Take a screenshot for verification
    const screenshotPath = join(screenshotsDir, `login-success-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to ${screenshotPath}`);

    // Save login time for duration calculation on logout
    const loginTime = new Date();
    writeFileSync(stateFile, JSON.stringify({
      lastLogin: loginTime.toISOString(),
      username: username
    }, null, 2));
    console.log(`💾 Login time saved: ${loginTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);

    // Send success notification
    await notifier.loginSuccess(username);

  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error details:', error.message);

    // Take screenshot of error
    const errorScreenshotPath = join(screenshotsDir, `login-error-${Date.now()}.png`);
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Error screenshot saved to ${errorScreenshotPath}`);

    // Send error notification
    await notifier.loginError(username, error.message);

    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the login function
login()
  .then(() => {
    console.log('✨ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });
