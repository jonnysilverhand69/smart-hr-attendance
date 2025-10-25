/**
 * Smart scheduler with randomization and work day validation
 */
export class Scheduler {
  constructor(config = {}) {
    this.loginTime = config.loginTime || '09:30';
    this.logoutTime = config.logoutTime || '19:30';
    this.workDays = config.workDays || [1, 2, 3, 4, 5, 6]; // Monday-Saturday
    this.randomDelay = config.randomDelay || 5; // minutes
    this.timezone = config.timezone || 'Asia/Kolkata';
  }

  /**
   * Check if today is a work day
   */
  isWorkDay(date = new Date()) {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return this.workDays.includes(day);
  }

  /**
   * Get random delay in minutes
   */
  getRandomDelay() {
    return Math.floor(Math.random() * (this.randomDelay * 2 + 1)) - this.randomDelay;
  }

  /**
   * Parse time string (HH:MM) and add random delay
   */
  parseTimeWithDelay(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const delay = this.getRandomDelay();

    let totalMinutes = hours * 60 + minutes + delay;

    // Handle overflow/underflow
    totalMinutes = Math.max(0, Math.min(1439, totalMinutes)); // 0-1439 minutes in a day

    const finalHours = Math.floor(totalMinutes / 60);
    const finalMinutes = totalMinutes % 60;

    return {
      hours: finalHours,
      minutes: finalMinutes,
      delay: delay,
      formatted: `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
    };
  }

  /**
   * Get next login time with randomization
   */
  getNextLoginTime() {
    const now = new Date();

    if (!this.isWorkDay(now)) {
      return {
        scheduled: false,
        reason: 'Not a work day',
        nextWorkDay: this.getNextWorkDay(now)
      };
    }

    const timeWithDelay = this.parseTimeWithDelay(this.loginTime);

    return {
      scheduled: true,
      baseTime: this.loginTime,
      actualTime: timeWithDelay.formatted,
      delay: timeWithDelay.delay,
      hours: timeWithDelay.hours,
      minutes: timeWithDelay.minutes
    };
  }

  /**
   * Get next logout time with randomization
   */
  getNextLogoutTime() {
    const now = new Date();

    if (!this.isWorkDay(now)) {
      return {
        scheduled: false,
        reason: 'Not a work day',
        nextWorkDay: this.getNextWorkDay(now)
      };
    }

    const timeWithDelay = this.parseTimeWithDelay(this.logoutTime);

    return {
      scheduled: true,
      baseTime: this.logoutTime,
      actualTime: timeWithDelay.formatted,
      delay: timeWithDelay.delay,
      hours: timeWithDelay.hours,
      minutes: timeWithDelay.minutes
    };
  }

  /**
   * Get next work day
   */
  getNextWorkDay(fromDate = new Date()) {
    const date = new Date(fromDate);
    let daysChecked = 0;

    while (daysChecked < 7) {
      date.setDate(date.getDate() + 1);
      if (this.isWorkDay(date)) {
        return date.toLocaleDateString('en-US', {
          timeZone: this.timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      daysChecked++;
    }

    return 'Unknown';
  }

  /**
   * Should run login now?
   */
  shouldRunLogin() {
    const now = new Date();

    if (!this.isWorkDay(now)) {
      return {
        shouldRun: false,
        reason: `Today is ${this.getDayName(now.getDay())} - not a work day`
      };
    }

    return {
      shouldRun: true,
      message: 'Work day confirmed'
    };
  }

  /**
   * Should run logout now?
   */
  shouldRunLogout() {
    return this.shouldRunLogin(); // Same logic
  }

  /**
   * Get day name
   */
  getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  /**
   * Get cron expression for login (with randomization handled separately)
   */
  getLoginCron() {
    const [hours, minutes] = this.loginTime.split(':').map(Number);
    // Run a few minutes before to allow for random delay calculation
    const adjustedMinutes = Math.max(0, minutes - this.randomDelay);
    return `${adjustedMinutes} ${hours} * * 1-6`; // Mon-Sat
  }

  /**
   * Get cron expression for logout
   */
  getLogoutCron() {
    const [hours, minutes] = this.logoutTime.split(':').map(Number);
    const adjustedMinutes = Math.max(0, minutes - this.randomDelay);
    return `${adjustedMinutes} ${hours} * * 1-6`; // Mon-Sat
  }

  /**
   * Calculate work duration
   */
  calculateWorkDuration(loginTime, logoutTime = new Date()) {
    const duration = logoutTime - loginTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return {
      milliseconds: duration,
      hours,
      minutes,
      formatted: `${hours}h ${minutes}m`
    };
  }

  /**
   * Get schedule summary
   */
  getSummary() {
    const loginInfo = this.getNextLoginTime();
    const logoutInfo = this.getNextLogoutTime();

    return {
      timezone: this.timezone,
      workDays: this.workDays.map(d => this.getDayName(d)),
      loginTime: loginInfo,
      logoutTime: logoutInfo,
      randomDelay: `±${this.randomDelay} minutes`,
      isWorkDay: this.isWorkDay(),
      nextWorkDay: this.isWorkDay() ? 'Today' : this.getNextWorkDay()
    };
  }
}

export default Scheduler;
