#!/bin/bash
set -e

echo "🚀 Starting HR Attendance Automation Container"
echo "📅 Current time: $(date)"

# Create necessary directories
mkdir -p /app/logs /app/screenshots /app/.config

# Check if .env file exists
if [ ! -f /app/.env ]; then
  echo "❌ ERROR: .env file not found!"
  echo "Please mount your .env file or set environment variables"
  exit 1
fi

echo "✅ Configuration loaded"

# Display schedule
echo ""
echo "📋 Schedule Configuration:"
echo "  Login Time: ${LOGIN_TIME:-09:30} IST (±5 min random)"
echo "  Logout Time: ${LOGOUT_TIME:-19:30} IST (±5 min random)"
echo "  Work Days: Monday - Saturday"
echo "  Timezone: ${TZ:-Asia/Kolkata}"
echo ""

# Install crontab
echo "⏰ Installing cron schedule..."
crontab /app/crontab
echo "✅ Cron schedule installed"

# List cron jobs for verification
echo ""
echo "📋 Active cron jobs:"
crontab -l
echo ""

# Start cron in foreground
echo "🎯 Starting cron daemon..."
exec cron -f
