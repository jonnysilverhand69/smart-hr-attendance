# Installation Guide

Complete installation guide for HR Attendance Automation system.

## Prerequisites

### Required
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment) ([Download](https://www.docker.com/))

### System Requirements
- **OS**: macOS, Linux, or Windows
- **RAM**: 512MB minimum (1GB recommended)
- **Disk**: 500MB free space
- **Internet**: Stable connection required

## Installation Methods

### Method 1: Docker (Easiest - Recommended for Production)

Perfect for: Production deployment, multiple instances, cloud servers

```bash
# 1. Clone repository
git clone <repository-url>
cd hrpautomation

# 2. Install dependencies (for CLI setup)
npm install

# 3. Run setup wizard
npm run setup

# 4. Start container
docker-compose up -d

# 5. Verify it's running
docker-compose ps
docker-compose logs -f
```

**Advantages:**
- ✅ Works on all platforms (Windows/Mac/Linux)
- ✅ Isolated environment
- ✅ Easy to deploy and scale
- ✅ Built-in cron scheduler
- ✅ Automatic restarts

### Method 2: Local Installation (macOS Scheduler)

Perfect for: Personal use on Mac, development

```bash
# 1. Clone repository
git clone <repository-url>
cd hrpautomation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Run setup wizard
npm run setup

# 5. Test manually
npm run login
npm run logout

# 6. Install automatic scheduler (macOS only)
npm run install:scheduler

# 7. Verify scheduler is running
launchctl list | grep hrautomation
```

**Advantages:**
- ✅ Native macOS integration
- ✅ No Docker required
- ✅ Easy to debug
- ✅ Direct file access

### Method 3: Manual Configuration (Advanced)

Perfect for: Custom setups, CI/CD integration

```bash
# 1. Clone repository
git clone <repository-url>
cd hrpautomation

# 2. Install dependencies
npm install
npx playwright install chromium

# 3. Create .env file manually
cp .env.example .env

# 4. Edit .env with your credentials
nano .env

# 5. Test
npm run login
npm run logout
```

## Detailed Setup Steps

### Step 1: Get Webhook URLs (Optional but Recommended)

#### Google Chat Webhook

1. Open Google Chat in browser
2. Go to your desired space/room
3. Click space name → **Manage webhooks**
4. Click **Add Webhook**
5. Name: `HR Attendance Bot`
6. Avatar URL (optional): Add any image URL
7. Click **Save**
8. **Copy the webhook URL** (starts with `https://chat.googleapis.com/`)

#### Discord Webhook

1. Open Discord desktop or web app
2. Go to your server
3. Right-click channel → **Edit Channel**
4. Go to **Integrations** → **Webhooks**
5. Click **New Webhook**
6. Name: `HR Attendance`
7. Choose channel
8. **Copy Webhook URL** (starts with `https://discord.com/api/webhooks/`)

### Step 2: Run Setup Wizard

```bash
npm run setup
```

The wizard will ask:

1. **Profile name**: Choose a name (e.g., "default", "john", "work")
2. **Username**: Your HR portal email (e.g., john.doe@yourcompany.com)
3. **Password**: Your HR portal password
4. **URL**: Leave default or enter custom URL
5. **Login time**: When to login (default: 09:30)
6. **Logout time**: When to logout (default: 19:30)
7. **Enable notifications**: Yes/No
8. **Google Chat webhook**: Paste webhook URL (if enabled)
9. **Discord webhook**: Paste webhook URL (if enabled)

### Step 3: Test the Setup

#### Test Login
```bash
npm run login
```

Expected output:
```
🚀 Starting login process...
📅 10/25/2025, 2:30:00 PM
👤 User: john.doe@yourcompany.com
🌐 Navigating to HR portal...
👤 Entering username...
🔑 Entering password...
🔓 Clicking login button...
✅ Login successful!
✅ Attendance marked automatically upon login
⏰ Completed at: 10/25/2025, 2:30:15 PM
⏱️  Duration: 15 seconds
📸 Screenshot saved to screenshots/login-success-1729860015123.png
✅ Google Chat notification sent
✅ Discord notification sent
✨ Process completed successfully
```

#### Test Logout
```bash
npm run logout
```

#### Check Screenshots
```bash
# macOS/Linux
open screenshots/

# Windows
explorer screenshots
```

### Step 4: Deploy

#### For Docker:

```bash
# Start container
docker-compose up -d

# View logs (live)
docker-compose logs -f hr-attendance

# Check status
docker-compose ps

# View cron schedule inside container
docker exec hr-attendance-automation crontab -l
```

#### For macOS Local:

```bash
# Install scheduler
npm run install:scheduler

# Check if running
launchctl list | grep hrautomation

# View logs
tail -f logs/login.log
tail -f logs/logout.log
```

## Verification

### Check Everything Works

1. **Verify config files exist:**
   ```bash
   ls -la .env .config/
   ```

2. **Test notifications:**
   ```bash
   # Run login and check Google Chat/Discord
   npm run login
   ```

3. **Check scheduler:**
   ```bash
   # Docker
   docker exec hr-attendance-automation crontab -l

   # macOS
   launchctl list | grep hrautomation
   ```

4. **View status dashboard:**
   ```bash
   npm run status
   ```

## Post-Installation

### Update .env Variables

You can manually edit `.env` anytime:

```bash
nano .env
# or
code .env
# or
vim .env
```

Important variables:
- `HR_USERNAME` - Your login email
- `HR_PASSWORD` - Your password
- `LOGIN_TIME` - Login time (HH:MM format)
- `LOGOUT_TIME` - Logout time (HH:MM format)
- `GOOGLE_CHAT_WEBHOOK` - Google Chat webhook URL
- `DISCORD_WEBHOOK` - Discord webhook URL
- `HEADLESS` - true/false (show browser)
- `RANDOM_DELAY` - Minutes of random variation (default: 5)

### Multiple Profiles

Add more users:

```bash
# Add new profile
npm run cli add

# List all profiles
npm run cli list

# View status
npm run status
```

Each profile is stored in `.config/profiles.json`.

### Logs Location

- **Docker**: `./logs/` (host machine)
- **macOS**: `./logs/` (project directory)
- **Docker internal**: `/app/logs/` (container)

Log files:
- `login.log` - Login attempts
- `logout.log` - Logout attempts
- `login-error.log` - Login errors
- `logout-error.log` - Logout errors
- `cron.log` - Cron execution log (Docker only)

### Screenshots Location

- `screenshots/login-success-<timestamp>.png`
- `screenshots/logout-success-<timestamp>.png`
- `screenshots/login-error-<timestamp>.png`
- `screenshots/logout-error-<timestamp>.png`

## Troubleshooting Installation

### npm install fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Playwright install fails

```bash
# Install with dependencies
npx playwright install --with-deps chromium

# On Linux, install system dependencies
sudo npx playwright install-deps
```

### Docker build fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild with no cache
docker-compose build --no-cache
```

### Permission denied (macOS)

```bash
# Make scripts executable
chmod +x cli.js
chmod +x docker-entrypoint.sh
```

### Can't connect to portal

1. Check internet connection
2. Verify URL in .env is correct
3. Try accessing portal manually in browser
4. Check if portal is down
5. Test with `HEADLESS=false` to see browser

### Notifications not working

1. **Test webhooks:**
   ```bash
   # Google Chat
   curl -X POST -H 'Content-Type: application/json' \
     -d '{"text":"Test from curl"}' \
     YOUR_GOOGLE_CHAT_WEBHOOK

   # Discord
   curl -X POST -H 'Content-Type: application/json' \
     -d '{"content":"Test from curl"}' \
     YOUR_DISCORD_WEBHOOK
   ```

2. Check webhook URLs are correct in .env
3. Verify `NOTIFICATIONS_ENABLED=true`
4. Check if webhooks expired/deleted

## Uninstallation

### Docker

```bash
# Stop and remove container
docker-compose down

# Remove images (optional)
docker rmi hr-attendance-automation

# Remove volumes (optional - deletes logs/screenshots)
docker volume prune
```

### macOS Scheduler

```bash
# Uninstall scheduler
npm run uninstall:scheduler

# Verify removal
launchctl list | grep hrautomation
```

### Complete Removal

```bash
# Remove project
cd ..
rm -rf hrpautomation

# On macOS, also remove scheduler files
rm ~/Library/LaunchAgents/com.hrautomation.*.plist
```

## Next Steps

After installation:

1. ✅ **Test manually** - Run `npm run login` and `npm run logout`
2. ✅ **Check notifications** - Verify messages in Google Chat/Discord
3. ✅ **View status** - Run `npm run status`
4. ✅ **Let it run** - Scheduler will handle daily automation
5. ✅ **Monitor logs** - Check logs periodically
6. ✅ **Share with team** - Help colleagues set up their own

## Support

- **Documentation**: See [README.md](README.md)
- **Issues**: Report on GitHub
- **Questions**: Open a discussion

---

**Installation complete! Your attendance is now automated. 🎉**
