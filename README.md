# 🤖 HR Attendance Automation

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/yourusername/hrpautomation?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/hrpautomation?style=social)

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-100%25_FREE-2088FF?logo=github-actions&logoColor=white)](#-github-actions-100-free)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

### **Never manually mark attendance again. Automate it in 2 minutes.**

*Login at 9:30 AM • Logout at 7:30 PM • Automatic notifications • 100% FREE with GitHub Actions*

[🚀 Quick Start](#-quick-start-2-minutes) • [⚡ GitHub Actions](#-github-actions-100-free) • [🎨 Features](#-features) • [❓ FAQ](#-faq)

</div>

---

## 🎯 What This Does

```
9:30 AM (±5 min)  →  🔓 Auto Login  →  ✅ Attendance Marked  →  📢 Notification
7:30 PM (±5 min)  →  🚪 Auto Logout  →  ✅ Punched Out      →  📢 Notification
```

**Works Monday-Saturday. Skips Sundays automatically.** 🏖️

---

## ⚡ GitHub Actions (100% FREE!)

**The easiest way. No server needed. Runs on GitHub for FREE!**

<table>
<tr>
<td width="30%">

### **1. Fork**
Click "Fork" button

![Fork](https://img.shields.io/badge/↑-Fork-blue?style=for-the-badge)

</td>
<td width="30%">

### **2. Enable Actions**
Actions tab → Enable

![Actions](https://img.shields.io/badge/⚙️-Enable-green?style=for-the-badge)

</td>
<td width="40%">

### **3. Add Secrets**
Settings → Secrets → Actions

![Secrets](https://img.shields.io/badge/🔒-Add_Secrets-orange?style=for-the-badge)

</td>
</tr>
</table>

### **Secrets to Add:**

```yaml
Settings → Secrets and variables → Actions → New repository secret
```

| Secret Name | Value | Example |
|------------|-------|---------|
| `HR_USERNAME` | Your email | `john.doe@yourcompany.com` |
| `HR_PASSWORD` | Your password | `YourSecurePassword123` |
| `HR_URL` | Portal URL | `https://your-hr-portal.com/login` |

**Optional:**
- `DISCORD_WEBHOOK` - Get Discord notifications ([How to get webhook](https://support.discord.com/hc/en-us/articles/228383668))
- `GOOGLE_CHAT_WEBHOOK` - Get Google Chat notifications

### **That's it!** 🎉

✅ Runs automatically at 9:25 AM & 7:25 PM IST
✅ Monday-Saturday (Sundays off)
✅ View logs in Actions tab
✅ 100% FREE (2000 min/month)
✅ No credit card needed

<details>
<summary>📖 <b>Advanced GitHub Actions Options</b></summary>

### Manual Trigger
Test anytime: Actions tab → "HR Attendance Automation" → Run workflow

### View Logs
Actions tab → Click on workflow run → Expand steps

### Download Screenshots (on failure)
Failed run → Scroll to Artifacts → Download screenshots

### Change Schedule
Edit `.github/workflows/attendance.yml`:
```yaml
on:
  schedule:
    - cron: '25 4 * * 1-6'  # 9:55 AM IST = 4:25 AM UTC
```

Use [crontab.guru](https://crontab.guru/) to build cron expressions!

**IST to UTC:** IST - 5:30 = UTC
- 9:00 AM IST = 3:30 AM UTC
- 10:00 AM IST = 4:30 AM UTC
- 7:00 PM IST = 1:30 PM UTC

</details>

---

## 🚀 Quick Start (2 Minutes)

### Option 1: GitHub Actions (Recommended - FREE!)
```bash
1. Fork this repo
2. Enable Actions
3. Add 3 secrets (username, password, URL)
4. Done! ✅
```

### Option 2: Local Setup
```bash
git clone https://github.com/yourusername/hrpautomation.git
cd hrpautomation
npm install
npm run setup    # Interactive wizard with epic ASCII art!
```

Choose your deployment:
- **GitHub Actions** - 100% FREE, no server
- **Docker** - `docker-compose up -d`
- **Cloud** - Railway/Render ($5-7/month)
- **macOS** - Local scheduler

---

## 🎨 Features

<table>
<tr>
<td>

### 🤖 Automation
- ✅ Auto login at 9:30 AM
- ✅ Auto logout at 7:30 PM
- ✅ ±5 min random (looks human!)
- ✅ Skips Sundays
- ✅ Monday-Saturday

</td>
<td>

### 📢 Notifications
- ✅ Discord webhooks
- ✅ Google Chat webhooks
- ✅ Fun facts with each message
- ✅ Success/error alerts
- ✅ Rich formatting

</td>
</tr>
<tr>
<td>

### 🎭 Epic UX
- ✅ 5 random ASCII art designs
- ✅ "FUCK HCL" splash screens
- ✅ 25+ hilarious fun facts
- ✅ Beautiful CLI with colors
- ✅ Loading animations

</td>
<td>

### 🚀 Deployment
- ✅ GitHub Actions (FREE!)
- ✅ Docker & Docker Compose
- ✅ Railway/Render/Fly.io
- ✅ macOS scheduler
- ✅ Multi-user support

</td>
</tr>
</table>

---

## 📸 Screenshots

**Setup Wizard:**
```
███████╗██╗   ██╗ ██████╗██╗  ██╗
██╔════╝██║   ██║██╔════╝██║ ██╔╝
█████╗  ██║   ██║██║     █████╔╝
██╔══╝  ██║   ██║██║     ██╔═██╗
██║     ╚██████╔╝╚██████╗██║  ██╗

      ██╗  ██╗ ██████╗██╗
      ██║  ██║██╔════╝██║
      ███████║██║     ██║
      ██╔══██║██║     ██║
      ██║  ██║╚██████╗███████╗

    Automation is the new resistance
```

**Discord Notification:**
```
🏢 HR Attendance System
✅ Login Successful

User: john.doe@yourcompany.com
Attendance marked successfully

💀 Fun Fact: Manual attendance has claimed
   more Monday mornings than alarm clocks
```

---

## 🐳 Other Deployment Options

<details>
<summary><b>Docker (Local or VPS)</b></summary>

```bash
# Quick start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Requires:** Docker installed

</details>

<details>
<summary><b>Cloud (Railway/Render)</b></summary>

### Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

**Cost:** $5/month

### Render
1. Go to [render.com](https://render.com)
2. New+ → Background Worker
3. Connect GitHub
4. Add environment variables
5. Create Worker

**Cost:** $7/month

</details>

<details>
<summary><b>macOS Scheduler (Local)</b></summary>

```bash
npm install
npm run setup
npm run install:scheduler

# Check status
launchctl list | grep hrautomation

# Uninstall
npm run uninstall:scheduler
```

**Requires:** macOS

</details>

---

## ⚙️ Configuration

All settings in `.env` file:

```env
# Required
HR_USERNAME=your.email@company.com
HR_PASSWORD=your-password
HR_URL=https://your-hr-portal.com

# Schedule (24-hour format)
LOGIN_TIME=09:30
LOGOUT_TIME=19:30
RANDOM_DELAY=5

# Notifications (optional)
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/...
NOTIFICATIONS_ENABLED=true

# Browser
HEADLESS=true
SCREENSHOTS_ENABLED=true

# Other
TZ=Asia/Kolkata
RETRIES=3
```

---

## 🛠️ CLI Commands

```bash
npm run setup          # Interactive setup wizard
npm run status         # View status dashboard
npm run login          # Test login manually
npm run logout         # Test logout manually

# Profile management
npm run cli list       # List all profiles
npm run cli add        # Add new profile
npm run cli delete     # Delete profile
```

---

## ❓ FAQ

<details>
<summary><b>Is GitHub Actions really free?</b></summary>

**Yes!** GitHub provides 2,000 minutes/month for free. This uses ~150 min/month. You'll use only 8% of your quota!

Public repos get unlimited minutes.

</details>

<details>
<summary><b>Will I get caught?</b></summary>

The script:
- Uses random delays (±5 min) to look human
- Runs from GitHub's IP (looks like remote work)
- Has the same login pattern as manual

**Tip:** Use it responsibly. Don't abuse it.

</details>

<details>
<summary><b>What if my password changes?</b></summary>

**GitHub Actions:** Update the `HR_PASSWORD` secret
**Local:** Run `npm run setup` again or edit `.env`

</details>

<details>
<summary><b>Can I use this for my team?</b></summary>

Yes! Each person should:
1. Fork the repo (their own copy)
2. Add their own secrets
3. Enable Actions

Or use multi-profile mode locally.

</details>

<details>
<summary><b>Does it work on weekends?</b></summary>

Sundays are skipped automatically. Saturday runs as normal (Mon-Sat schedule).

</details>

<details>
<summary><b>How do I know it's working?</b></summary>

**GitHub Actions:**
- Check Actions tab for green checkmarks
- Enable Discord/Google Chat notifications
- Download screenshots from artifacts (on failure)

**Local:**
- Check logs in `logs/` folder
- Check screenshots in `screenshots/` folder
- View notifications in Discord/Chat

</details>

<details>
<summary><b>Can I change the schedule?</b></summary>

**GitHub Actions:** Edit `.github/workflows/attendance.yml`
**Docker:** Edit `crontab` file and rebuild
**Local:** Edit `.env` and reinstall scheduler

</details>

<details>
<summary><b>What if the HR portal changes?</b></summary>

The selectors might break. You can:
1. Run `npx playwright codegen YOUR_URL` to record new steps
2. Update `scripts/login.js` and `scripts/logout.js`
3. Submit a PR to help others!

</details>

---

## 🎉 Share This!

If this saved you time:

- ⭐ **Star this repository** - It helps others discover it!
- 🐦 **Tweet about it** - Share your automation story
- 💬 **Tell colleagues** - Help them automate too
- 📝 **Write a blog post** - Tutorial for others
- 🎥 **Make a video** - Show the setup process

**Sample tweet:**
```
🤖 Just automated my HR attendance with GitHub Actions - 100% FREE!

No more manual login/logout 🎉

✅ Fork repo
✅ Add 3 secrets
✅ Done!

Check it out: [your-repo-link]

#automation #GitHub #productivity
```

---

## 🤝 Contributing

Contributions welcome! Ideas:

- 🌐 Support for more HR portals
- 🔔 New notification channels (Telegram, WhatsApp)
- 🎨 More ASCII art designs
- 💡 New fun facts
- 📚 Better documentation
- 🐛 Bug fixes

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📜 License

ISC License - Do whatever you want!

---

## ⚠️ Disclaimer

This tool is for personal use only. Use responsibly and in accordance with your organization's policies. The authors are not responsible for any consequences of using this tool.

---

## 🙏 Credits

Built with:
- [Playwright](https://playwright.dev/) - Browser automation
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive CLI
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Docker](https://www.docker.com/) - Containerization
- Love and corporate rebellion ❤️🔥

---

<div align="center">

### **Made with ❤️ for developers who automate everything**

⭐ **Star this repo** if it saved your time!

![GitHub stars](https://img.shields.io/github/stars/yourusername/hrpautomation?style=social)

**[⬆ Back to Top](#-hr-attendance-automation)**

</div>
