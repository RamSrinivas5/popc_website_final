// ============================================================
// DASHBOARD & NAVIGATION — Appium iOS Page Object Model
// ============================================================
const BaseIOSPage = require('./BasePage');

class DashboardIOSPage extends BaseIOSPage {
  constructor() {
    super();
    const els = this.config.elements;
    this.homeTab = this.byAccessibility(els.homeTab);
    this.patientsTab = this.byAccessibility(els.patientsTab);
    this.surveysTab = this.byAccessibility(els.surveysTab);
    this.dashboardTab = this.byAccessibility(els.dashboardTab);
    this.profileTab = this.byAccessibility(els.profileTab);
    this.chatTab = this.byAccessibility(els.chatTab);
    this.settingsTab = this.byAccessibility(els.settingsTab);
    this.logoutBtn = this.byAccessibility(els.logoutButton);
  }

  async goToHome() { await this.tap(this.homeTab); }
  async goToPatients() { await this.tap(this.patientsTab); }
  async goToSurveys() { await this.tap(this.surveysTab); }
  async goToDashboard() { await this.tap(this.dashboardTab); }
  async goToProfile() { await this.tap(this.profileTab); }
  async goToChat() { await this.tap(this.chatTab); }
  async goToSettings() { await this.tap(this.settingsTab); }
  async logout() {
    await this.goToSettings();
    await this.tap(this.logoutBtn);
  }
}

module.exports = DashboardIOSPage;
