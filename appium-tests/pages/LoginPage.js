// ============================================================
// LOGIN PAGE — Appium iOS Page Object Model
// ============================================================
const BaseIOSPage = require('./BasePage');

class LoginIOSPage extends BaseIOSPage {
  constructor() {
    super();
    const els = this.config.elements;
    this.usernameInput = this.byAccessibility(els.usernameField);
    this.passwordInput = this.byAccessibility(els.passwordField);
    this.loginBtn = this.byAccessibility(els.loginButton);
    this.forgotPassBtn = this.byAccessibility(els.forgotPasswordLink);
    this.registerBtn = this.byAccessibility(els.registerLink);
    this.errorText = this.byAccessibility(els.errorMessage);
    this.eyeBtn = this.byAccessibility(els.eyeToggle);
  }

  async open() {
    await this.restartApp();
  }

  async enterUsername(username) {
    await this.typeText(this.usernameInput, username);
  }

  async enterPassword(password) {
    await this.typeText(this.passwordInput, password);
  }

  async tapLogin() {
    await this.tap(this.loginBtn);
  }

  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.errorText);
    } catch {
      return '';
    }
  }

  async isLoggedIn() {
    return await this.isDisplayed(this.byAccessibility(this.config.elements.homeScreen), 10000);
  }

  async tapForgotPassword() {
    await this.tap(this.forgotPassBtn);
  }

  async tapRegister() {
    await this.tap(this.registerBtn);
  }

  async togglePasswordVisibility() {
    await this.tap(this.eyeBtn);
  }
}

module.exports = LoginIOSPage;
