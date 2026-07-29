// ============================================================
// LOGIN PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    // Locators
    this.usernameInput = By.css('input[name="username"], input[type="text"], #username');
    this.passwordInput = By.css('input[type="password"], #password');
    this.loginButton = By.css('button[type="submit"], button.login-btn, #login-btn');
    this.errorMessage = By.css('.error-message, .alert-error, [data-testid="error"]');
    this.forgotPasswordLink = By.css('a[href*="forgot"], .forgot-password');
    this.registerLink = By.css('a[href*="register"], .register-link');
    this.rememberMeCheckbox = By.css('input[type="checkbox"], #remember-me');
    this.pageTitle = By.css('h1, h2, .login-title, .page-title');
    this.loadingSpinner = By.css('.loading, .spinner, [data-testid="loading"]');
    this.successToast = By.css('.toast-success, .success-message, [data-testid="success"]');
    this.eyeIcon = By.css('.eye-icon, .toggle-password, [data-testid="toggle-pwd"]');
    this.logoElement = By.css('.logo, .brand-logo, img[alt*="POPC"]');
  }

  async open() {
    await this.navigate(config.routes.login);
  }

  async enterUsername(username) {
    await this.type(this.usernameInput, username);
  }

  async enterPassword(password) {
    await this.type(this.passwordInput, password);
  }

  async clickLogin() {
    await this.click(this.loginButton);
  }

  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async loginWithValidCredentials() {
    await this.login(config.testUser.username, config.testUser.password);
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  async isLoggedIn() {
    try {
      await this.waitForUrl('/home', 10000);
      return true;
    } catch {
      return false;
    }
  }

  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  async clickRegister() {
    await this.click(this.registerLink);
  }

  async togglePasswordVisibility() {
    await this.click(this.eyeIcon);
  }

  async isPasswordVisible() {
    const type = await this.getAttribute(this.passwordInput, 'type');
    return type === 'text';
  }

  async isLoginButtonEnabled() {
    return await this.isEnabled(this.loginButton);
  }

  async getPageTitle() {
    try {
      return await this.getText(this.pageTitle);
    } catch {
      return await this.getTitle();
    }
  }

  async isUsernameFieldVisible() {
    return await this.isDisplayed(this.usernameInput);
  }

  async isPasswordFieldVisible() {
    return await this.isDisplayed(this.passwordInput);
  }

  async isLoginButtonVisible() {
    return await this.isDisplayed(this.loginButton);
  }

  async isForgotPasswordVisible() {
    return await this.isDisplayed(this.forgotPasswordLink);
  }

  async isRegisterLinkVisible() {
    return await this.isDisplayed(this.registerLink);
  }

  async isErrorDisplayed() {
    return await this.isDisplayed(this.errorMessage);
  }

  async getPasswordFieldType() {
    try {
      return await this.getAttribute(this.passwordInput, 'type');
    } catch {
      return 'password';
    }
  }
}

module.exports = LoginPage;
