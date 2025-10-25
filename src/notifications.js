import fetch from 'node-fetch';
import { getRandomFact } from './splash.js';

/**
 * Notification system supporting Google Chat and Discord
 */
export class NotificationManager {
  constructor(config = {}) {
    this.googleChatWebhook = config.googleChatWebhook || process.env.GOOGLE_CHAT_WEBHOOK;
    this.discordWebhook = config.discordWebhook || process.env.DISCORD_WEBHOOK;
    this.enabled = config.enabled !== false;
  }

  /**
   * Send notification to all configured channels
   */
  async send(message, type = 'info') {
    if (!this.enabled) {
      console.log('📵 Notifications disabled');
      return;
    }

    const promises = [];

    if (this.googleChatWebhook) {
      promises.push(this.sendGoogleChat(message, type));
    }

    if (this.discordWebhook) {
      promises.push(this.sendDiscord(message, type));
    }

    if (promises.length === 0) {
      console.log('ℹ️  No notification webhooks configured');
      return;
    }

    try {
      await Promise.all(promises);
      console.log('✅ Notifications sent successfully');
    } catch (error) {
      console.error('⚠️  Some notifications failed:', error.message);
    }
  }

  /**
   * Send to Google Chat
   */
  async sendGoogleChat(message, type) {
    if (!this.googleChatWebhook) return;

    const emoji = this.getEmoji(type);
    const color = this.getColor(type);
    const funFact = getRandomFact();

    const payload = {
      cards: [{
        header: {
          title: '🏢 HR Attendance System',
          subtitle: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        },
        sections: [{
          widgets: [{
            textParagraph: {
              text: `<b>${emoji} ${type.toUpperCase()}</b><br>${message}`
            }
          }, {
            textParagraph: {
              text: `<i>${funFact}</i>`
            }
          }]
        }]
      }]
    };

    try {
      const response = await fetch(this.googleChatWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Google Chat webhook failed: ${response.statusText}`);
      }

      console.log('✅ Google Chat notification sent');
    } catch (error) {
      console.error('❌ Google Chat notification failed:', error.message);
      throw error;
    }
  }

  /**
   * Send to Discord
   */
  async sendDiscord(message, type) {
    if (!this.discordWebhook) return;

    const emoji = this.getEmoji(type);
    const color = this.getColorHex(type);
    const funFact = getRandomFact();

    const payload = {
      embeds: [{
        title: `${emoji} HR Attendance System`,
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'HR Automation | ' + funFact
        },
        fields: [{
          name: 'Status',
          value: type.toUpperCase(),
          inline: true
        }, {
          name: 'Time (IST)',
          value: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            timeStyle: 'medium'
          }),
          inline: true
        }]
      }]
    };

    try {
      const response = await fetch(this.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.statusText}`);
      }

      console.log('✅ Discord notification sent');
    } catch (error) {
      console.error('❌ Discord notification failed:', error.message);
      throw error;
    }
  }

  /**
   * Quick notification methods
   */
  async loginSuccess(username) {
    await this.send(
      `✅ **Login Successful**\n\nUser: ${username}\nAttendance marked successfully`,
      'success'
    );
  }

  async logoutSuccess(username, duration) {
    await this.send(
      `🚪 **Logout Successful**\n\nUser: ${username}\nWork duration: ${duration}`,
      'success'
    );
  }

  async loginError(username, error) {
    await this.send(
      `❌ **Login Failed**\n\nUser: ${username}\nError: ${error}`,
      'error'
    );
  }

  async logoutError(username, error) {
    await this.send(
      `❌ **Logout Failed**\n\nUser: ${username}\nError: ${error}`,
      'error'
    );
  }

  /**
   * Helper methods
   */
  getEmoji(type) {
    const emojis = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return emojis[type] || 'ℹ️';
  }

  getColor(type) {
    const colors = {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue'
    };
    return colors[type] || 'blue';
  }

  getColorHex(type) {
    const colors = {
      success: 0x00ff00,
      error: 0xff0000,
      warning: 0xffff00,
      info: 0x0099ff
    };
    return colors[type] || 0x0099ff;
  }
}

export default NotificationManager;
