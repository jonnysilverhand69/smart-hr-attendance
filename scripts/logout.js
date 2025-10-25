import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
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

// Track login time
const stateFile = join(__dirname, '..', '.config', 'state.json');

async function logout() {
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
  const workDayCheck = scheduler.shouldRunLogout();
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

  try {
    console.log('🚪 Starting logout process...');
    console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);

    // Navigate to HR portal
    console.log('🌐 Navigating to HR portal...');
    await page.goto(process.env.HR_URL, { waitUntil: 'networkidle' });

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
    console.log('🔓 Logging in first...');
    await page.getByText('Login', { exact: true }).click();

    // Wait for and handle the OK dialog (if present)
    try {
      await page.waitForTimeout(2000);
      const okButton = page.getByRole('button', { name: 'OK' });
      if (await okButton.isVisible({ timeout: 3000 })) {
        await okButton.click();
        console.log('✅ Handled login confirmation dialog');
      }
    } catch (error) {
      console.log('ℹ️  No confirmation dialog found (this is normal)');
    }

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Click on user profile dropdown (generic - works for any user)
    console.log('👤 Opening user menu...');
    // Find the listitem that contains "Settings" text (this is the user profile menu)
    await page.getByRole('listitem').filter({ hasText: 'Settings' }).getByRole('link').first().click();

    // Wait a moment for dropdown to appear
    await page.waitForTimeout(1000);

    // Handle the logout dialog that appears
    console.log('🚪 Clicking signout...');
    page.once('dialog', dialog => {
      console.log(`💬 Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {}); // Accept the logout confirmation
    });

    // Click the signout link (generic - matches any user's signout link)
    // Look for link containing "Signout" text and "Punch in time" text
    await page.getByRole('link', { name: /Signout.*Punch in time/i }).click();

    // Wait for logout to complete
    await page.waitForTimeout(3000);

    console.log('✅ Logout successful!');

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`⏰ Completed at: ${endTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    // Calculate actual work duration from login time
    let workDuration = '~10 hours'; // Default fallback
    try {
      if (existsSync(stateFile)) {
        const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
        if (state.lastLogin) {
          const loginTime = new Date(state.lastLogin);
          const workMilliseconds = endTime - loginTime;
          const workHours = Math.floor(workMilliseconds / (1000 * 60 * 60));
          const workMinutes = Math.floor((workMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

          workDuration = `${workHours}h ${workMinutes}m`;
          console.log(`⏰ Login was at: ${loginTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
          console.log(`📊 Total work duration: ${workDuration}`);
        }
      }
    } catch (error) {
      console.log('⚠️  Could not calculate exact work duration, using default');
    }

    // Take a screenshot for verification
    const screenshotPath = join(screenshotsDir, `logout-success-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to ${screenshotPath}`);

    // Send success notification
    await notifier.logoutSuccess(username, workDuration);

  } catch (error) {
    console.error('❌ Logout failed!');
    console.error('Error details:', error.message);

    // Take screenshot of error
    const errorScreenshotPath = join(screenshotsDir, `logout-error-${Date.now()}.png`);
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Error screenshot saved to ${errorScreenshotPath}`);

    // Send error notification
    await notifier.logoutError(username, error.message);

    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the logout function
logout()
  .then(() => {
    console.log('✨ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Process failed:', error);
    process.exit(1);
  });
