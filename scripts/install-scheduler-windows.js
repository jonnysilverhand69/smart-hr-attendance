#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectPath = join(__dirname, '..');

// Load environment variables from .env to get configured times
dotenv.config({ path: join(projectPath, '.env') });

// Parse login and logout times from .env (format: HH:MM)
const loginTime = (process.env.LOGIN_TIME || '09:30').split(':');
const logoutTime = (process.env.LOGOUT_TIME || '19:30').split(':');
const loginHourIST = parseInt(loginTime[0]);
const loginMinuteIST = parseInt(loginTime[1]);
const logoutHourIST = parseInt(logoutTime[0]);
const logoutMinuteIST = parseInt(logoutTime[1]);

// Adjust for random delay - run 5 minutes before configured time
const adjustedLoginHour = loginMinuteIST >= 5 ? loginHourIST : (loginHourIST === 0 ? 23 : loginHourIST - 1);
const adjustedLoginMinute = loginMinuteIST >= 5 ? loginMinuteIST - 5 : 60 + loginMinuteIST - 5;
const adjustedLogoutHour = logoutMinuteIST >= 5 ? logoutHourIST : (logoutHourIST === 0 ? 23 : logoutHourIST - 1);
const adjustedLogoutMinute = logoutMinuteIST >= 5 ? logoutMinuteIST - 5 : 60 + logoutMinuteIST - 5;

// Format time for Windows Task Scheduler (HH:MM)
const loginTimeFormatted = `${adjustedLoginHour.toString().padStart(2, '0')}:${adjustedLoginMinute.toString().padStart(2, '0')}`;
const logoutTimeFormatted = `${adjustedLogoutHour.toString().padStart(2, '0')}:${adjustedLogoutMinute.toString().padStart(2, '0')}`;

// Get node path
let nodePath = 'node';
try {
  nodePath = execSync('where node').toString().trim().split('\n')[0];
} catch (err) {
  nodePath = 'node'; // Default to PATH
}

// Create logs directory
mkdirSync(join(projectPath, 'logs'), { recursive: true });

console.log('📝 Installing Windows Task Scheduler tasks...\n');

try {
  // Create login task
  console.log('📋 Creating login task...');

  // Delete old task if exists
  try {
    execSync('schtasks /Delete /TN "HRAutomation_Login" /F', { stdio: 'pipe' });
  } catch (err) {
    // Task doesn't exist, continue
  }

  // Create new login task
  const loginTaskXML = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>HR Attendance Automation - Login</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-01-01T${loginTimeFormatted}:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByWeek>
        <DaysOfWeek>
          <Monday />
          <Tuesday />
          <Wednesday />
          <Thursday />
          <Friday />
          <Saturday />
        </DaysOfWeek>
        <WeeksInterval>1</WeeksInterval>
      </ScheduleByWeek>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>${nodePath}</Command>
      <Arguments>"${projectPath}\\scripts\\login.js"</Arguments>
      <WorkingDirectory>${projectPath}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;

  const loginTaskFile = join(projectPath, 'login-task.xml');
  writeFileSync(loginTaskFile, loginTaskXML);

  execSync(`schtasks /Create /TN "HRAutomation_Login" /XML "${loginTaskFile}" /F`, { stdio: 'pipe' });
  console.log(`✅ Login task created (runs at ${loginTimeFormatted} Mon-Sat)`);

  // Create logout task
  console.log('\n📋 Creating logout task...');

  try {
    execSync('schtasks /Delete /TN "HRAutomation_Logout" /F', { stdio: 'pipe' });
  } catch (err) {
    // Task doesn't exist, continue
  }

  const logoutTaskXML = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>HR Attendance Automation - Logout</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-01-01T${logoutTimeFormatted}:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByWeek>
        <DaysOfWeek>
          <Monday />
          <Tuesday />
          <Wednesday />
          <Thursday />
          <Friday />
          <Saturday />
        </DaysOfWeek>
        <WeeksInterval>1</WeeksInterval>
      </ScheduleByWeek>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>${nodePath}</Command>
      <Arguments>"${projectPath}\\scripts\\logout.js"</Arguments>
      <WorkingDirectory>${projectPath}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;

  const logoutTaskFile = join(projectPath, 'logout-task.xml');
  writeFileSync(logoutTaskFile, logoutTaskXML);

  execSync(`schtasks /Create /TN "HRAutomation_Logout" /XML "${logoutTaskFile}" /F`, { stdio: 'pipe' });
  console.log(`✅ Logout task created (runs at ${logoutTimeFormatted} Mon-Sat)`);

  console.log('\n✨ Task Scheduler installation complete!\n');
  console.log('📅 Schedule (from .env):');
  console.log(`   • Target Login Time: ${process.env.LOGIN_TIME} (±5 min random)`);
  console.log(`   • Target Logout Time: ${process.env.LOGOUT_TIME} (±5 min random)`);
  console.log(`   • Scheduler runs 5 min before to allow for random delay`);
  console.log(`   • Work Days: Monday - Saturday (Sundays skipped automatically)\n`);

  console.log('📊 To check status:');
  console.log('   schtasks /Query /TN "HRAutomation_Login"');
  console.log('   schtasks /Query /TN "HRAutomation_Logout"\n');

  console.log('📝 Logs will be saved to:');
  console.log(`   ${projectPath}\\logs\\\n`);

  console.log('🛑 To uninstall:');
  console.log('   npm run uninstall:scheduler\n');

} catch (error) {
  console.error('❌ Failed to install Task Scheduler tasks:', error.message);
  console.log('\n💡 Make sure you run this command as Administrator');
  console.log('   Right-click CMD/PowerShell → Run as Administrator\n');
  process.exit(1);
}
