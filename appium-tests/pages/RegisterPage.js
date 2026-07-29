// ============================================================
// REGISTER PAGE — Appium iOS Page Object Model
// ============================================================
const BaseIOSPage = require('./BasePage');

class RegisterIOSPage extends BaseIOSPage {
  constructor() {
    super();
    const els = this.config.elements;
    this.firstNameInput = this.byAccessibility(els.firstNameField);
    this.lastNameInput = this.byAccessibility(els.lastNameField);
    this.emailInput = this.byAccessibility(els.emailField);
    this.passwordInput = this.byAccessibility(els.registerPasswordField);
    this.confirmPasswordInput = this.byAccessibility(els.confirmPasswordField);
    this.hospitalInput = this.byAccessibility(els.hospitalField);
    this.licenseInput = this.byAccessibility(els.licenseField);
    this.submitBtn = this.byAccessibility(els.registerButton);
  }

  async fillForm(data) {
    if (data.firstName) await this.typeText(this.firstNameInput, data.firstName);
    if (data.lastName) await this.typeText(this.lastNameInput, data.lastName);
    if (data.email) await this.typeText(this.emailInput, data.email);
    if (data.password) await this.typeText(this.passwordInput, data.password);
    if (data.confirmPassword) await this.typeText(this.confirmPasswordInput, data.confirmPassword);
    if (data.hospital) await this.typeText(this.hospitalInput, data.hospital);
    if (data.license) await this.typeText(this.licenseInput, data.license);
  }

  async submit() {
    await this.tap(this.submitBtn);
  }

  async register(data) {
    await this.fillForm(data);
    await this.submit();
  }
}

module.exports = RegisterIOSPage;
