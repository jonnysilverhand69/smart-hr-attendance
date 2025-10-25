# ⚡ GitHub Actions Deployment Guide

**100% FREE - No Credit Card Required!**

Deploy HR Attendance Automation using GitHub Actions. Runs completely free on GitHub's infrastructure!

## Why GitHub Actions?

✅ **Completely FREE** - GitHub provides 2,000 minutes/month for free
✅ **No Credit Card** - Just need a GitHub account
✅ **Zero Maintenance** - GitHub handles everything
✅ **Built-in Logging** - See execution logs in Actions tab
✅ **Automatic Screenshots** - Saved as artifacts on failure
✅ **Manual Trigger** - Test anytime with one click

## Quick Setup (5 minutes)

### Step 1: Fork the Repository

1. Go to the main repository on GitHub
2. Click the **"Fork"** button (top right)
3. GitHub will create your own copy

### Step 2: Enable GitHub Actions

1. Go to your forked repository
2. Click the **"Actions"** tab
3. Click **"I understand my workflows, go ahead and enable them"**

### Step 3: Add Repository Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add the following secrets:

#### Required Secrets

| Secret Name | Value | Example |
|-------------|-------|---------|
| `HR_USERNAME` | Your HR portal email | `john.doe@yourcompany.com` |
| `HR_PASSWORD` | Your HR portal password | `YourPassword123` |
| `HR_URL` | Your HR portal URL | `https://hr-erp.shivnadarfoundation.org/Adrenalin/` |

#### Optional Secrets

| Secret Name | Value | Default | Description |
|-------------|-------|---------|-------------|
| `LOGIN_TIME` | Login time (HH:MM) | `09:30` | When to login |
| `LOGOUT_TIME` | Logout time (HH:MM) | `19:30` | When to logout |
| `DISCORD_WEBHOOK` | Discord webhook URL | - | For notifications |
| `GOOGLE_CHAT_WEBHOOK` | Google Chat webhook URL | - | For notifications |
| `NOTIFICATIONS_ENABLED` | true/false | `true` | Enable notifications |

### Step 4: Done! 🎉

The workflow will run automatically:
- **Login**: 9:25 AM IST (3:55 AM UTC) Monday-Saturday
- **Logout**: 7:25 PM IST (1:55 PM UTC) Monday-Saturday

## How to Add a Secret

1. Click **"New repository secret"**
2. **Name**: Enter the secret name (e.g., `HR_USERNAME`)
3. **Secret**: Enter the value (e.g., `john.doe@yourcompany.com`)
4. Click **"Add secret"**
5. Repeat for all required secrets

## Verify It's Working

### Check Workflow Status

1. Go to **Actions** tab
2. You'll see workflow runs listed
3. Click on any run to see detailed logs
4. Green checkmark ✅ = Success
5. Red X ❌ = Failed (check logs)

### Manual Test

Want to test right now?

1. Go to **Actions** tab
2. Click **"HR Attendance Automation"** workflow
3. Click **"Run workflow"** dropdown
4. Select action: `login` or `logout`
5. Click **"Run workflow"**
6. Watch it execute in real-time!

### View Logs

1. Go to **Actions** tab
2. Click on a workflow run
3. Click **"attendance"** job
4. Expand steps to see detailed logs
5. Look for ✅ Login successful! or ✅ Logout successful!

### Download Screenshots (on failure)

If a run fails:
1. Go to the failed run
2. Scroll down to **"Artifacts"**
3. Download **"screenshots-xxx"**
4. Unzip to see what went wrong

## Schedule Details

The workflow runs on this schedule (IST):

| Time (IST) | Time (UTC) | Action | Days |
|------------|------------|--------|------|
| 9:25 AM | 3:55 AM | Login | Mon-Sat |
| 7:25 PM | 1:55 PM | Logout | Mon-Sat |

**Note**: Times are 5 minutes before to account for random delay in the script (±5 min).

## Customizing Schedule

Want different times? Edit `.github/workflows/attendance.yml`:

```yaml
on:
  schedule:
    # Login at 10:00 AM IST (4:30 AM UTC)
    - cron: '30 4 * * 1-6'
    # Logout at 8:00 PM IST (2:30 PM UTC)
    - cron: '30 14 * * 1-6'
```

**Cron format**: `minute hour day month weekday`

**Convert IST to UTC**: IST - 5:30 = UTC
- 9:00 AM IST = 3:30 AM UTC
- 10:00 AM IST = 4:30 AM UTC
- 7:00 PM IST = 1:30 PM UTC

Use [crontab.guru](https://crontab.guru/) to help build cron expressions!

## Troubleshooting

### Workflow Not Running

**Check**:
1. Did you enable Actions? (Step 2)
2. Are secrets added correctly? (Step 3)
3. Is the workflow file present in `.github/workflows/`?

**Fix**:
- Re-enable Actions in Settings
- Check secret names (case-sensitive!)
- Make sure you forked the latest version

### Login/Logout Failed

**Check logs**:
1. Actions tab → Click failed run
2. Look for error message
3. Common issues:
   - Wrong credentials
   - HR portal changed
   - Network issues

**Fix**:
- Verify `HR_USERNAME` and `HR_PASSWORD` secrets
- Test credentials manually in browser
- Check if HR portal is accessible

### Screenshots Not Generated

Screenshots are only saved on failure. If workflow succeeds, no screenshots are uploaded (to save space).

To always save screenshots, modify workflow:

```yaml
- name: Upload screenshots
  if: always()  # Changed from failure()
  uses: actions/upload-artifact@v4
  ...
```

### Notifications Not Working

**Check**:
1. Are webhook secrets added?
2. Is `NOTIFICATIONS_ENABLED` set to `true`?
3. Are webhooks valid?

**Test webhook**:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Test"}' YOUR_WEBHOOK_URL
```

## Advanced Usage

### Multiple Profiles

Want to run for multiple users?

**Option 1: Multiple Workflows**
1. Duplicate `.github/workflows/attendance.yml`
2. Rename to `attendance-user2.yml`
3. Add secrets: `HR_USERNAME_2`, `HR_PASSWORD_2`, etc.
4. Update workflow to use new secrets

**Option 2: Matrix Strategy**
```yaml
strategy:
  matrix:
    profile: [user1, user2, user3]
```

### Custom Times per Day

Different schedule for different days:

```yaml
on:
  schedule:
    # Monday-Friday: 9 AM
    - cron: '30 3 * * 1-5'
    # Saturday: 10 AM
    - cron: '30 4 * * 6'
```

### Notifications on Success

Get notified every time:

```yaml
- name: Notify Success
  if: success()
  run: |
    echo "Success! Add notification logic here"
```

## Cost & Limits

### GitHub Free Tier

- **2,000 minutes/month** for private repos
- **Unlimited** for public repos
- Resets monthly

### This Workflow Usage

Each run takes ~2-3 minutes:
- **2 runs/day** × **26 days/month** = **52 runs**
- **52 runs** × **3 minutes** = **156 minutes/month**

**You'll use ~8% of free quota!** Plenty of room!

### Make it Public

If your repo is public:
- ✅ **Unlimited minutes**
- ✅ Completely free forever
- ⚠️  Your workflow is visible (but secrets are hidden)

## Security

### Are My Credentials Safe?

✅ **YES!** GitHub Secrets are:
- Encrypted at rest
- Never exposed in logs
- Only available during workflow execution
- Not accessible to anyone (not even you!)

### Best Practices

1. **Never commit** `.env` file
2. **Use secrets** for all sensitive data
3. **Enable 2FA** on GitHub account
4. **Make repo private** if you prefer
5. **Rotate credentials** periodically

### What's Visible?

✅ **Hidden (Safe)**:
- All secrets (passwords, webhooks)
- Values used in environment variables

❌ **Visible (Public if repo is public)**:
- Workflow file structure
- When it runs
- Success/failure status
- General logs (but not secret values)

## FAQ

**Q: Is GitHub Actions really free?**
A: Yes! 2,000 minutes/month for private repos, unlimited for public repos.

**Q: What if I exceed the limit?**
A: Workflows stop running. Upgrade to paid plan or make repo public.

**Q: Can I use this for multiple people?**
A: Yes! Either duplicate workflows or use matrix strategy.

**Q: Does it work on weekends?**
A: Sundays are skipped automatically. Saturday runs as normal (Mon-Sat schedule).

**Q: Can I test it now?**
A: Yes! Use manual trigger: Actions → Run workflow → Choose login/logout.

**Q: What if my password changes?**
A: Update the `HR_PASSWORD` secret. Go to Settings → Secrets → Edit.

**Q: Can I see the screenshots?**
A: Only on failed runs. They're saved as artifacts.

**Q: Is it better than Railway/Docker?**
A: **Pros**: Completely free, no server needed.
**Cons**: Runs on GitHub's schedule, can't customize too much.

**Q: Can GitHub see my password?**
A: Secrets are encrypted and only decrypted during workflow execution. GitHub employees cannot see them.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/hrpautomation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/hrpautomation/discussions)
- **Workflow Syntax**: [GitHub Actions Docs](https://docs.github.com/en/actions)

## Example Workflow Run

```
✅ Setup Node.js
✅ Install dependencies
✅ Install Playwright
✅ Run Login
   🚀 Starting login process...
   📅 25/10/2025, 9:30:00 AM
   👤 User: john.doe@yourcompany.com
   🌐 Navigating to HR portal...
   👤 Entering username...
   🔑 Entering password...
   🔓 Clicking login button...
   ✅ Login successful!
   ✅ Attendance marked
   ✅ Discord notification sent
   📸 Screenshot saved
   ✨ Process completed
```

---

## Share This!

If GitHub Actions deployment worked for you:

- ⭐ **Star this repository**
- 🐦 **Tweet**: "Just set up FREE HR automation with GitHub Actions! 🎉"
- 💬 **Share** with colleagues
- 📝 **Write** a tutorial
- 🎥 **Make** a video

---

<div align="center">

**Made with ❤️ and GitHub's free tier**

⚡ Deploy in 5 minutes • 💰 100% FREE • 🔒 Secure • ♾️ Unlimited

[Back to README](README.md) • [All Deployment Options](DEPLOY.md)

</div>
