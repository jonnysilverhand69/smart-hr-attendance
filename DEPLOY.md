# One-Click Deployment Guide 🚀

Deploy HR Attendance Automation to the cloud in minutes!

## Quick Deploy Options

### Railway (Easiest - Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hr-attendance)

**Steps:**

1. **Click the Deploy button above** (or manually deploy below)

2. **Fork this repository** to your GitHub account

3. **Go to [Railway.app](https://railway.app)** and sign in

4. **Click "New Project" → "Deploy from GitHub repo"**

5. **Select your forked repository**

6. **Add environment variables:**
   ```
   HR_USERNAME=your.email@yourcompany.com
   HR_PASSWORD=your-password
   HR_URL=https://hr-erp.shivnadarfoundation.org/Adrenalin/
   LOGIN_TIME=09:30
   LOGOUT_TIME=19:30
   GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/...
   DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
   TZ=Asia/Kolkata
   HEADLESS=true
   NOTIFICATIONS_ENABLED=true
   ```

7. **Click Deploy** - Done! 🎉

**Cost:** $5/month (Railway hobby plan)

---

### Render.com (Also Easy)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Steps:**

1. **Fork this repository**

2. **Go to [Render.com](https://render.com)** and sign in

3. **Click "New +" → "Background Worker"**

4. **Connect your GitHub repository**

5. **Render will auto-detect** the Docker configuration

6. **Add environment variables** (same as Railway above)

7. **Click "Create Worker"** - Done! 🎉

**Cost:** $7/month (Render starter plan)

---

### Fly.io (Geek-Friendly)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Launch app (in project directory)
fly launch

# Set secrets
fly secrets set HR_USERNAME=your.email@yourcompany.com
fly secrets set HR_PASSWORD=your-password
fly secrets set GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/...
fly secrets set DISCORD_WEBHOOK=https://discord.com/api/webhooks/...

# Deploy
fly deploy
```

**Cost:** ~$3/month (Fly.io shared CPU)

---

### DigitalOcean App Platform

1. **Fork this repository**

2. **Go to [DigitalOcean](https://cloud.digitalocean.com/apps)**

3. **Click "Create App" → "GitHub"**

4. **Select your repository**

5. **Choose "Dockerfile" as build method**

6. **Add environment variables**

7. **Click "Next" → "Launch App"**

**Cost:** $5/month (Basic plan)

---

### Heroku (Classic)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-hr-automation

# Set environment variables
heroku config:set HR_USERNAME=your.email@yourcompany.com
heroku config:set HR_PASSWORD=your-password
heroku config:set GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/...
heroku config:set DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
heroku config:set TZ=Asia/Kolkata

# Deploy
git push heroku main
```

**Cost:** $7/month (Eco dyno)

---

### AWS ECS (For the Brave)

1. **Build and push Docker image:**
   ```bash
   docker build -t hr-attendance .
   docker tag hr-attendance:latest your-ecr-repo/hr-attendance:latest
   docker push your-ecr-repo/hr-attendance:latest
   ```

2. **Create ECS task definition** with environment variables

3. **Create ECS service** with 1 task

4. **Done!**

**Cost:** ~$10-20/month (t3.micro)

---

### Google Cloud Run

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy hr-attendance \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars HR_USERNAME=your.email@yourcompany.com \
  --set-env-vars HR_PASSWORD=your-password \
  --set-env-vars GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/... \
  --set-env-vars TZ=Asia/Kolkata
```

**Cost:** ~$5/month (Cloud Run always-on)

---

## Self-Hosted Options

### Your Own Server (Ubuntu/Debian)

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/hrpautomation.git
cd hrpautomation

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Run setup
npm install
npm run setup

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Cost:** $5-10/month (DigitalOcean/Linode/Vultr droplet)

---

### Raspberry Pi (Why Not?)

```bash
# Same as above, but use ARM-compatible base image
# Edit Dockerfile: FROM arm64v8/node:18-slim
```

**Cost:** Free (if you have a Pi)

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HR_USERNAME` | ✅ Yes | - | Your HR portal email |
| `HR_PASSWORD` | ✅ Yes | - | Your HR portal password |
| `HR_URL` | No | (default URL) | HR portal URL |
| `LOGIN_TIME` | No | 09:30 | Login time (HH:MM) |
| `LOGOUT_TIME` | No | 19:30 | Logout time (HH:MM) |
| `GOOGLE_CHAT_WEBHOOK` | No | - | Google Chat webhook URL |
| `DISCORD_WEBHOOK` | No | - | Discord webhook URL |
| `TZ` | No | Asia/Kolkata | Timezone |
| `HEADLESS` | No | true | Run browser headless |
| `NOTIFICATIONS_ENABLED` | No | true | Enable notifications |
| `RANDOM_DELAY` | No | 5 | Random delay in minutes |

---

## Verification After Deployment

### Check if it's running:

**Railway/Render:**
- Go to your dashboard
- Check "Logs" tab
- Look for "Starting HR Attendance Automation Container"

**Docker (self-hosted):**
```bash
docker-compose ps
docker-compose logs -f
```

### Test notifications:

Wait for the next scheduled run, or trigger manually:
```bash
# Railway/Render: Use their CLI or dashboard console
# Docker:
docker exec hr-attendance-automation node /app/scripts/login.js
```

### View logs:

All platforms store logs. Check your platform's dashboard or:
```bash
# Docker
docker-compose logs --tail=100 -f
```

---

## Troubleshooting

### Container keeps restarting

1. Check environment variables are set correctly
2. Check logs for specific errors
3. Verify HR_URL is accessible
4. Test credentials manually in browser

### Notifications not working

1. Verify webhook URLs are correct
2. Test webhooks manually with curl:
   ```bash
   curl -X POST -H 'Content-Type: application/json' \
     -d '{"text":"Test"}' YOUR_WEBHOOK_URL
   ```

### Timezone issues

Make sure `TZ=Asia/Kolkata` is set in environment variables.

### Playwright/Chromium errors

Some platforms need explicit Chromium installation. Check platform-specific notes in their docs.

---

## Cost Comparison

| Platform | Monthly Cost | Difficulty | Notes |
|----------|-------------|-----------|-------|
| Railway | $5 | ⭐ Easiest | Best for beginners |
| Render | $7 | ⭐⭐ Easy | Good reliability |
| Fly.io | $3 | ⭐⭐⭐ Medium | Cheapest option |
| DigitalOcean | $5 | ⭐⭐ Easy | Good UI |
| Heroku | $7 | ⭐⭐ Easy | Classic choice |
| Self-hosted VPS | $5-10 | ⭐⭐⭐⭐ Hard | Full control |
| AWS ECS | $10-20 | ⭐⭐⭐⭐⭐ Expert | Enterprise |

---

## Security Notes

1. **Never commit secrets** - Always use environment variables
2. **Use private repositories** - Keep your credentials safe
3. **Rotate passwords** - Change credentials periodically
4. **Monitor logs** - Check for suspicious activity
5. **Use SSH keys** - For server access

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/hrpautomation/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/hrpautomation/discussions)
- **Email:** your-email@example.com

---

## Next Steps After Deployment

1. ✅ **Verify logs** - Check if cron is running
2. ✅ **Test notifications** - Trigger manual login
3. ✅ **Set up monitoring** - Use platform's built-in monitoring
4. ✅ **Relax** - Your attendance is now automated! 🎉

---

**Made with ❤️  and a healthy dose of corporate rebellion**
