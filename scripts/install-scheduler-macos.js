import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectPath = join(__dirname, '..');
const username = execSync('whoami').toString().trim();
const launchAgentsPath = join(homedir(), 'Library', 'LaunchAgents');

// Load environment variables from .env to get configured times
dotenv.config({ path: join(projectPath, '.env') });

// Parse login and logout times from .env (format: HH:MM)
const loginTime = (process.env.LOGIN_TIME || '09:30').split(':');
const logoutTime = (process.env.LOGOUT_TIME || '19:30').split(':');
const loginHour = parseInt(loginTime[0]);
const loginMinute = parseInt(loginTime[1]);
const logoutHour = parseInt(logoutTime[0]);
const logoutMinute = parseInt(logoutTime[1]);

// Adjust for random delay - run 5 minutes before configured time
// The script itself will add random ±5 min delay
const adjustedLoginHour = loginMinute >= 5 ? loginHour : (loginHour === 0 ? 23 : loginHour - 1);
const adjustedLoginMinute = loginMinute >= 5 ? loginMinute - 5 : 60 + loginMinute - 5;
const adjustedLogoutHour = logoutMinute >= 5 ? logoutHour : (logoutHour === 0 ? 23 : logoutHour - 1);
const adjustedLogoutMinute = logoutMinute >= 5 ? logoutMinute - 5 : 60 + logoutMinute - 5;

// Ensure LaunchAgents directory exists
try {
  mkdirSync(launchAgentsPath, { recursive: true });
} catch (err) {
  // Directory might already exist
}

// Morning login job (uses configured time from .env)
const loginPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hrautomation.login</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${projectPath}/scripts/login.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>${adjustedLoginHour}</integer>
        <key>Minute</key>
        <integer>${adjustedLoginMinute}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>${projectPath}/logs/login.log</string>
    <key>StandardErrorPath</key>
    <string>${projectPath}/logs/login-error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>`;

// Evening logout job (uses configured time from .env)
const logoutPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hrautomation.logout</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${projectPath}/scripts/logout.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>${adjustedLogoutHour}</integer>
        <key>Minute</key>
        <integer>${adjustedLogoutMinute}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>${projectPath}/logs/logout.log</string>
    <key>StandardErrorPath</key>
    <string>${projectPath}/logs/logout-error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>`;

// Recovery check job - runs every hour to catch missed schedules
const recoveryPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hrautomation.recovery</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${projectPath}/scripts/check-missed-attendance.js</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>${projectPath}/logs/recovery.log</string>
    <key>StandardErrorPath</key>
    <string>${projectPath}/logs/recovery-error.log</string>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>`;

// Create logs directory
mkdirSync(join(projectPath, 'logs'), { recursive: true });

// Write plist files
const loginPlistPath = join(launchAgentsPath, 'com.hrautomation.login.plist');
const logoutPlistPath = join(launchAgentsPath, 'com.hrautomation.logout.plist');
const recoveryPlistPath = join(launchAgentsPath, 'com.hrautomation.recovery.plist');

console.log('📝 Creating scheduler configuration files...');
writeFileSync(loginPlistPath, loginPlist);
writeFileSync(logoutPlistPath, logoutPlist);
writeFileSync(recoveryPlistPath, recoveryPlist);
console.log('✅ Configuration files created');

console.log('\n📋 Installing login scheduler...');
try {
  execSync(`launchctl unload ${loginPlistPath} 2>/dev/null || true`);
  execSync(`launchctl load ${loginPlistPath}`);
  console.log(`✅ Login scheduler installed (runs at ${adjustedLoginHour.toString().padStart(2, '0')}:${adjustedLoginMinute.toString().padStart(2, '0')} daily)`);
} catch (error) {
  console.error('❌ Failed to install login scheduler:', error.message);
}

console.log('\n📋 Installing logout scheduler...');
try {
  execSync(`launchctl unload ${logoutPlistPath} 2>/dev/null || true`);
  execSync(`launchctl load ${logoutPlistPath}`);
  console.log(`✅ Logout scheduler installed (runs at ${adjustedLogoutHour.toString().padStart(2, '0')}:${adjustedLogoutMinute.toString().padStart(2, '0')} daily)`);
} catch (error) {
  console.error('❌ Failed to install logout scheduler:', error.message);
}

console.log('\n📋 Installing recovery checker...');
try {
  execSync(`launchctl unload ${recoveryPlistPath} 2>/dev/null || true`);
  execSync(`launchctl load ${recoveryPlistPath}`);
  console.log(`✅ Recovery checker installed (runs every hour + on boot)`);
} catch (error) {
  console.error('❌ Failed to install recovery checker:', error.message);
}

console.log('\n✨ Scheduler installation complete!');
console.log('\n📅 Schedule (from .env):');
console.log(`   • Target Login Time: ${process.env.LOGIN_TIME} (±5 min random)`);
console.log(`   • Target Logout Time: ${process.env.LOGOUT_TIME} (±5 min random)`);
console.log(`   • Scheduler runs 5 min before to allow for random delay`);
console.log(`   • Work Days: Monday - Saturday (Sundays skipped automatically)`);
console.log(`   • Recovery Check: Every hour + on system boot (catches missed schedules)`);
console.log('\n📊 To check status:');
console.log('   launchctl list | grep hrautomation');
console.log('\n📝 Logs will be saved to:');
console.log(`   ${projectPath}/logs/`);
console.log('\n🛑 To uninstall:');
console.log('   npm run uninstall:scheduler');
