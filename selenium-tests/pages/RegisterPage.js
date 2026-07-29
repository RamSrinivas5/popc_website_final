// ============================================================
// REGISTER PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.firstNameInput = By.css('input[name="first_name"], #first_name, input[placeholder*="First"]');
    this.lastNameInput = By.css('input[name="last_name"], #last_name, input[placeholder*="Last"]');
    this.emailInput = By.css('input[type="email"], input[name="email"], #email');
    this.usernameInput = By.css('input[name="username"], #username');
    this.passwordInput = By.css('input[name="password"], #password');
    this.confirmPasswordInput = By.css('input[name="confirm_password"], input[name="password2"], #confirm_password');
    this.specialtySelect = By.css('select[name="specialty"], #specialty');
    this.hospitalInput = By.css('input[name="hospital"], #hospital');
    this.licenseInput = By.css('input[name="license_number"], #license_number');
    this.submitButton = By.css('button[type="submit"], .register-btn');
    this.loginLink = By.css('a[href*="login"], .login-link');
    this.errorMessage = By.css('.error-message, .field-error, [data-testid="error"]');
    this.successMessage = By.css('.success-message, .toast-success');
    this.termsCheckbox = By.css('input[name="terms"], #terms');
    this.passwordStrengthIndicator = By.css('.password-strength, .strength-indicator');
  }

  async open() {
    await this.navigate(config.routes.register);
  }

  async fillRegistrationForm(data) {
    if (data.firstName) await this.type(this.firstNameInput, data.firstName);
    if (data.lastName) await this.type(this.lastNameInput, data.lastName);
    if (data.email) await this.type(this.emailInput, data.email);
    if (data.username) await this.type(this.usernameInput, data.username);
    if (data.password) await this.type(this.passwordInput, data.password);
    if (data.confirmPassword) await this.type(this.confirmPasswordInput, data.confirmPassword);
    if (data.hospital) await this.type(this.hospitalInput, data.hospital);
    if (data.license) await this.type(this.licenseInput, data.license);
  }

  async submitForm() {
    await this.click(this.submitButton);
  }

  async register(data) {
    await this.fillRegistrationForm(data);
    await this.submitForm();
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  async isSuccessful() {
    try {
      await this.waitForUrl('/verify-otp', 8000);
      return true;
    } catch {
      return false;
    }
  }

  async getPasswordStrengthText() {
    try {
      return await this.getText(this.passwordStrengthIndicator);
    } catch {
      return '';
    }
  }
}

module.exports = RegisterPage;
