# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🎯 For Complete Beginners

### Step 1: Get the Code

```bash
# Clone or download this repository
git clone https://github.com/yourusername/hrpautomation.git
cd hrpautomation
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Setup Wizard

```bash
npm run setup
```

You'll see an epic ASCII art screen (it's different every time! 🎨)

Answer these questions:
- Profile name: `my-profile` (or your name)
- Username: Your HR portal email
- Password: Your HR portal password
- Login time: `09:30` (or when you want to login)
- Logout time: `19:30` (or when you want to logout)
- Enable notifications: `Yes` (optional but cool!)

### Step 4: Get Webhook URLs (Optional)

**For Google Chat:**
1. Open Google Chat on web
2. Go to any space/channel
3. Click space name → "Manage webhooks"
4. Click "Add Webhook"
5. Copy the URL

**For Discord:**
1. Open Discord
2. Right-click any channel → "Edit Channel"
3. Go to "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Copy the URL

Paste these when the setup asks!

### Step 5: Test It

```bash
# Test login
npm run login

# Check your Google Chat or Discord - you should see a notification!
# Check screenshots/ folder for proof
```

### Step 6: Deploy (Choose One)

**Option A: GitHub Actions (100% FREE! Recommended!)**
1. Fork this repo on GitHub
2. Go to Actions tab → Enable workflows
3. Go to Settings → Secrets → Actions
4. Add secrets: `HR_USERNAME`, `HR_PASSWORD`, `HR_URL`
5. Done! Runs automatically for FREE! 🎉
**[Full Guide](GITHUB_ACTIONS.md)**

**Option B: Docker (Easiest for Local)**
```bash
docker-compose up -d
```

**Option C: Cloud (Railway)**
1. Go to https://railway.app
2. Sign up (free)
3. Click "New Project" → "Deploy from GitHub"
4. Select this repo
5. Add your environment variables from `.env`
6. Click "Deploy"
7. Done! 🎉

**Option D: macOS Scheduler**
```bash
npm run install:scheduler
```

## 🎉 You're Done!

Your attendance is now automated!

### What Happens Next?

- **9:30 AM (±5 min)**: Auto login + attendance ✅
- **7:30 PM (±5 min)**: Auto logout ✅
- **Sundays**: Skipped automatically 🏖️
- **Notifications**: Sent to Google Chat/Discord 📢
- **Screenshots**: Saved as proof 📸

### Check Status

```bash
npm run status
```

### View Logs

```bash
# Docker
docker-compose logs -f

# macOS
cat logs/login.log
cat logs/logout.log
```

## 💡 Pro Tips

1. **Random timing**: The ±5 min delay makes it look human!
2. **Fun facts**: Check your notifications for random fun facts 😄
3. **Multiple profiles**: Run `npm run cli add` to add more users
4. **Screenshots**: Your proof is in `screenshots/` folder
5. **Troubleshooting**: Set `HEADLESS=false` in `.env` to see the browser

## 🆘 Common Issues

**"Login failed"**
- Check username/password in `.env`
- Try with `HEADLESS=false` to see what's happening
- Make sure HR portal is accessible

**"Notifications not working"**
- Verify webhook URLs are correct
- Test webhook manually with curl (see INSTALL.md)
- Check `NOTIFICATIONS_ENABLED=true` in `.env`

**"Scheduler not running"**
- Docker: `docker-compose restart`
- macOS: `npm run uninstall:scheduler && npm run install:scheduler`

## 📚 More Help

- **Installation**: [INSTALL.md](INSTALL.md)
- **Deployment**: [DEPLOY.md](DEPLOY.md)
- **Full README**: [README.md](README.md)

## 🎨 Fun Features

- **5 different ASCII art designs** - Random on each setup
- **25+ fun facts** - Random with every notification
- **Colorful CLI** - Beautiful terminal interface
- **Loading animations** - With sassy messages

---

**Enjoy your freedom! 🚀**

*(Remember: This is for personal use only. Don't abuse it!)*
