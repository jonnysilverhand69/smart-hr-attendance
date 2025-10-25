# Contributing to HR Attendance Automation

First off, thanks for taking the time to contribute! 🎉

We love contributions from the community! Whether it's a bug report, feature request, or code contribution, we appreciate your help making this project better.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**Great bug reports include:**
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

### 💡 Suggesting Features

We love new ideas! Create an issue with the `enhancement` label.

**Great feature requests include:**
- Clear use case
- Why it would be useful
- Mockups or examples if applicable
- Willingness to help implement it

### 🔧 Code Contributions

1. **Fork the repo**
   ```bash
   git clone https://github.com/yourusername/hrpautomation.git
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm run login
   npm run logout
   ```

5. **Commit**
   ```bash
   git commit -m "Add: amazing feature that does X"
   ```

   Commit message format:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Remove:` for removed code
   - `Docs:` for documentation only changes

6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

## Development Setup

```bash
# Install dependencies
npm install

# Install Playwright
npx playwright install chromium

# Run setup
npm run setup

# Test
npm run login
npm run logout
```

## Code Style

- Use ES6+ features
- Use async/await over promises
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## What We're Looking For

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX improvements to CLI
- 🌐 Support for more HR portals
- 🔔 New notification channels
- 🚀 Performance improvements

## Community

- Be respectful and inclusive
- Help others in issues/discussions
- Share your use cases
- Spread the word!

## Recognition

Contributors will be:
- Added to README
- Mentioned in release notes
- Eternally grateful from the community 🙏

---

## Ideas for Contributions

### Easy (Good First Issues)
- Add more fun facts to `src/splash.js`
- Create more ASCII art designs
- Improve error messages
- Add more examples to documentation
- Fix typos

### Medium
- Add support for new notification channels (Telegram, WhatsApp)
- Create GitHub Action workflow
- Add unit tests
- Improve Docker image size
- Add more deployment platforms

### Advanced
- Add GUI application (Electron?)
- Create browser extension
- Add OAuth support
- Machine learning for optimal timing
- Multi-portal support

---

**Thank you for contributing! 🚀**

Every contribution, no matter how small, makes this project better for everyone.
