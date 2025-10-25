# 🚀 Quick Deploy

## Instant Deployment (Choose One)

### Railway (Recommended - Easiest)
```bash
# 1. Fork this repo
# 2. Visit: https://railway.app
# 3. Click: New Project → Deploy from GitHub
# 4. Add these variables:
```
```env
HR_USERNAME=your.email@yourcompany.com
HR_PASSWORD=your-password
GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/...
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```
```bash
# 5. Click Deploy
# DONE! 🎉
```

### Render.com
```bash
# 1. Fork this repo
# 2. Visit: https://render.com
# 3. New+ → Background Worker → Connect GitHub
# 4. Add same environment variables as above
# 5. Create Worker
# DONE! 🎉
```

### Fly.io (Cheapest)
```bash
fly launch
fly secrets set HR_USERNAME=your.email@yourcompany.com HR_PASSWORD=your-password
fly deploy
# DONE! 🎉
```

## Full Documentation

See [DEPLOY.md](DEPLOY.md) for detailed instructions for all platforms.

## Cost

- Railway: $5/month
- Render: $7/month
- Fly.io: $3/month
- Self-hosted: $5-10/month

## Support

- Documentation: [README.md](README.md)
- Installation: [INSTALL.md](INSTALL.md)
- Deployment: [DEPLOY.md](DEPLOY.md)
