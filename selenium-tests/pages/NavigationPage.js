// ============================================================
// NAVIGATION / LAYOUT PAGE — Page Object Model
// Covers sidebar, top nav, and routing
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class NavigationPage extends BasePage {
  constructor(driver) {
    super(driver);
    // Sidebar nav
    this.sidebar = By.css('.sidebar, nav.sidebar, [data-testid="sidebar"]');
    this.homeNavLink = By.css('a[href="/home"], nav a.home, [data-testid="nav-home"]');
    this.patientsNavLink = By.css('a[href="/patients"], nav a.patients, [data-testid="nav-patients"]');
    this.surveysNavLink = By.css('a[href="/surveys"], nav a.surveys, [data-testid="nav-surveys"]');
    this.dashboardNavLink = By.css('a[href="/dashboard"], nav a.dashboard, [data-testid="nav-dashboard"]');
    this.chatNavLink = By.css('a[href="/chat"], nav a.chat, [data-testid="nav-chat"]');
    this.settingsNavLink = By.css('a[href="/settings"], nav a.settings, [data-testid="nav-settings"]');
    this.profileNavLink = By.css('a[href="/profile"], nav a.profile, [data-testid="nav-profile"]');
    this.infoNavLink = By.css('a[href="/info"], nav a.info, [data-testid="nav-info"]');
    this.logoutBtn = By.css('button.logout, [data-testid="logout"], a.logout');

    // Top bar
    this.topBar = By.css('.topbar, header.topbar, .navbar');
    this.hamburgerMenu = By.css('.hamburger, .menu-toggle, [data-testid="menu-toggle"]');
    this.pageTitle = By.css('.page-title, h1.title, header h1');
    this.breadcrumbs = By.css('.breadcrumb, [data-testid="breadcrumb"]');
    this.notificationBell = By.css('.notification-bell, [data-testid="notifications"]');
    this.userMenu = By.css('.user-menu, .user-dropdown, [data-testid="user-menu"]');

    // Active states
    this.activeNavItem = By.css('.nav-item.active, a.active, [aria-current="page"]');
  }

  async clickHome() {
    await this.click(this.homeNavLink);
    await this.waitForUrl('/home');
  }

  async clickPatients() {
    await this.click(this.patientsNavLink);
    await this.waitForUrl('/patients');
  }

  async clickSurveys() {
    await this.click(this.surveysNavLink);
    await this.waitForUrl('/surveys');
  }

  async clickDashboard() {
    await this.click(this.dashboardNavLink);
    await this.waitForUrl('/dashboard');
  }

  async clickChat() {
    await this.click(this.chatNavLink);
    await this.waitForUrl('/chat');
  }

  async clickSettings() {
    await this.click(this.settingsNavLink);
    await this.waitForUrl('/settings');
  }

  async clickProfile() {
    await this.click(this.profileNavLink);
    await this.waitForUrl('/profile');
  }

  async logout() {
    await this.click(this.logoutBtn);
    await this.waitForUrl('/login');
  }

  async isSidebarVisible() {
    return await this.isDisplayed(this.sidebar);
  }

  async toggleHamburger() {
    await this.click(this.hamburgerMenu);
  }

  async getActiveNavItem() {
    try {
      return await this.getText(this.activeNavItem);
    } catch {
      return '';
    }
  }

  async getPageTitle() {
    try {
      return await this.getText(this.pageTitle);
    } catch {
      return await this.getTitle();
    }
  }
}

module.exports = NavigationPage;
