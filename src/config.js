import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(__dirname, '..', '.config');
const CONFIG_FILE = join(CONFIG_DIR, 'profiles.json');

/**
 * Configuration manager for multi-user profiles
 */
export class ConfigManager {
  constructor() {
    this.ensureConfigDir();
    this.profiles = this.loadProfiles();
  }

  /**
   * Ensure config directory exists
   */
  ensureConfigDir() {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  /**
   * Load all profiles from config file
   */
  loadProfiles() {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }

    try {
      const data = readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading profiles:', error.message);
      return {};
    }
  }

  /**
   * Save profiles to config file
   */
  saveProfiles() {
    try {
      writeFileSync(CONFIG_FILE, JSON.stringify(this.profiles, null, 2));
      console.log('✅ Profiles saved successfully');
    } catch (error) {
      console.error('❌ Error saving profiles:', error.message);
      throw error;
    }
  }

  /**
   * Add or update a profile
   */
  addProfile(profileName, config) {
    this.profiles[profileName] = {
      ...config,
      createdAt: this.profiles[profileName]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveProfiles();
    return this.profiles[profileName];
  }

  /**
   * Get a profile by name
   */
  getProfile(profileName) {
    return this.profiles[profileName] || null;
  }

  /**
   * Get all profiles
   */
  getAllProfiles() {
    return this.profiles;
  }

  /**
   * Delete a profile
   */
  deleteProfile(profileName) {
    if (this.profiles[profileName]) {
      delete this.profiles[profileName];
      this.saveProfiles();
      return true;
    }
    return false;
  }

  /**
   * List all profile names
   */
  listProfileNames() {
    return Object.keys(this.profiles);
  }

  /**
   * Get default profile (first one or specified)
   */
  getDefaultProfile() {
    const names = this.listProfileNames();
    if (names.length === 0) return null;

    // Check if any profile is marked as default
    const defaultProfile = names.find(name => this.profiles[name].isDefault);
    return defaultProfile || names[0];
  }

  /**
   * Set a profile as default
   */
  setDefaultProfile(profileName) {
    if (!this.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found`);
    }

    // Remove default flag from all profiles
    Object.keys(this.profiles).forEach(name => {
      this.profiles[name].isDefault = false;
    });

    // Set new default
    this.profiles[profileName].isDefault = true;
    this.saveProfiles();
  }

  /**
   * Validate profile configuration
   */
  validateProfile(config) {
    const required = ['username', 'password', 'url'];
    const missing = required.filter(field => !config[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate schedule if provided
    if (config.schedule) {
      this.validateSchedule(config.schedule);
    }

    return true;
  }

  /**
   * Validate schedule configuration
   */
  validateSchedule(schedule) {
    if (schedule.loginTime) {
      this.validateTime(schedule.loginTime, 'loginTime');
    }

    if (schedule.logoutTime) {
      this.validateTime(schedule.logoutTime, 'logoutTime');
    }

    if (schedule.workDays && !Array.isArray(schedule.workDays)) {
      throw new Error('workDays must be an array');
    }

    return true;
  }

  /**
   * Validate time format (HH:MM)
   */
  validateTime(time, fieldName) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error(`Invalid ${fieldName} format. Use HH:MM (24-hour format)`);
    }
    return true;
  }

  /**
   * Create default configuration
   */
  static createDefaultConfig() {
    return {
      username: '',
      password: '',
      url: 'https://hr-erp.shivnadarfoundation.org/Adrenalin/',
      schedule: {
        loginTime: '09:30',
        logoutTime: '19:30',
        workDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday (0 = Sunday)
        randomDelay: 5 // minutes
      },
      notifications: {
        enabled: true,
        googleChat: {
          enabled: false,
          webhook: ''
        },
        discord: {
          enabled: false,
          webhook: ''
        }
      },
      options: {
        headless: true,
        screenshots: true,
        retries: 3
      }
    };
  }

  /**
   * Export profile to .env format
   */
  exportToEnv(profileName) {
    const profile = this.getProfile(profileName);
    if (!profile) {
      throw new Error(`Profile "${profileName}" not found`);
    }

    return `# HR Attendance Automation - Profile: ${profileName}
HR_USERNAME=${profile.username}
HR_PASSWORD=${profile.password}
HR_URL=${profile.url}
LOGIN_TIME=${profile.schedule?.loginTime || '09:30'}
LOGOUT_TIME=${profile.schedule?.logoutTime || '19:30'}
GOOGLE_CHAT_WEBHOOK=${profile.notifications?.googleChat?.webhook || ''}
DISCORD_WEBHOOK=${profile.notifications?.discord?.webhook || ''}
HEADLESS=${profile.options?.headless !== false}
SCREENSHOTS_ENABLED=${profile.options?.screenshots !== false}
`;
  }
}

export default ConfigManager;
