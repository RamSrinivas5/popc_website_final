// ============================================================
// PROFILE PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.firstNameInput = By.css('input[name="first_name"], #first_name');
    this.lastNameInput = By.css('input[name="last_name"], #last_name');
    this.emailDisplay = By.css('.email-display, [data-testid="email"]');
    this.phoneInput = By.css('input[name="phone"], #phone');
    this.specialtyInput = By.css('input[name="specialty"], select[name="specialty"]');
    this.hospitalInput = By.css('input[name="hospital"], #hospital');
    this.licenseInput = By.css('input[name="license_number"], #license');
    this.avatarImage = By.css('.avatar, img.profile-photo, [data-testid="avatar"]');
    this.avatarUpload = By.css('input[type="file"], #avatar-upload');
    this.editProfileBtn = By.css('button.edit-profile, [data-testid="edit-profile"]');
    this.saveProfileBtn = By.css('button[type="submit"], button.save-profile');
    this.cancelEditBtn = By.css('button.cancel, [data-testid="cancel-edit"]');
    this.successMessage = By.css('.success-toast, .alert-success');
    this.errorMessage = By.css('.error-toast, .alert-error');
    this.usernameDisplay = By.css('.username-display, [data-testid="username"]');
    this.joinDateDisplay = By.css('.join-date, [data-testid="join-date"]');
  }

  async open() {
    await this.navigate(config.routes.profile);
  }

  async clickEditProfile() {
    await this.click(this.editProfileBtn);
  }

  async updateFirstName(name) {
    await this.clearAndType(this.firstNameInput, name);
  }

  async updateLastName(name) {
    await this.clearAndType(this.lastNameInput, name);
  }

  async updatePhone(phone) {
    await this.clearAndType(this.phoneInput, phone);
  }

  async saveProfile() {
    await this.click(this.saveProfileBtn);
  }

  async cancelEdit() {
    await this.click(this.cancelEditBtn);
  }

  async getSuccessMessage() {
    try {
      return await this.getText(this.successMessage);
    } catch {
      return '';
    }
  }

  async getDisplayedName() {
    try {
      return await this.getText(By.css('.profile-name, .display-name, h1, h2'));
    } catch {
      return '';
    }
  }

  async isAvatarDisplayed() {
    return await this.isDisplayed(this.avatarImage);
  }
}

module.exports = ProfilePage;
