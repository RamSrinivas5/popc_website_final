// ============================================================
// DASHBOARD PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.statsCards = By.css('.stat-card, .dashboard-card, .metric-card');
    this.totalPatientsCard = By.css('[data-testid="total-patients"], .total-patients');
    this.pendingSurveysCard = By.css('[data-testid="pending-surveys"], .pending-surveys');
    this.highRiskCard = By.css('[data-testid="high-risk"], .high-risk');
    this.recentActivityList = By.css('.recent-activity, .activity-list');
    this.chart = By.css('.recharts-wrapper, canvas, .chart-container');
    this.viewPendingBtn = By.css('a[href*="pending"], .view-pending');
    this.viewHighRiskBtn = By.css('a[href*="high-risk"], .view-high-risk');
    this.refreshBtn = By.css('button.refresh, [data-testid="refresh"]');
    this.dateRangeFilter = By.css('.date-range, select[name="date_range"]');
    this.loadingState = By.css('.loading, .skeleton, [data-testid="loading"]');
    this.errorState = By.css('.error-state, [data-testid="error-state"]');
    this.emptyState = By.css('.empty-state, [data-testid="empty-dashboard"]');
    this.welcomeMessage = By.css('.welcome-message, .greeting, h1');
    this.lastUpdated = By.css('.last-updated, .timestamp');
  }

  async open() {
    await this.navigate(config.routes.dashboard);
  }

  async openPendingSurveys() {
    await this.navigate(config.routes.pendingSurveys);
  }

  async openHighRiskList() {
    await this.navigate(config.routes.highRisk);
  }

  async getStatCardCount() {
    const cards = await this.findElements(this.statsCards);
    return cards.length;
  }

  async getTotalPatients() {
    try {
      return await this.getText(this.totalPatientsCard);
    } catch {
      return '0';
    }
  }

  async getPendingSurveys() {
    try {
      return await this.getText(this.pendingSurveysCard);
    } catch {
      return '0';
    }
  }

  async isChartVisible() {
    return await this.isDisplayed(this.chart, 8000);
  }

  async clickViewPending() {
    await this.click(this.viewPendingBtn);
  }

  async clickViewHighRisk() {
    await this.click(this.viewHighRiskBtn);
  }

  async isLoaded() {
    const loading = await this.isDisplayed(this.loadingState, 2000);
    if (loading) {
      await this.driver.wait(async () => {
        return !(await this.isDisplayed(this.loadingState, 1000));
      }, 15000);
    }
    return true;
  }

  async getWelcomeText() {
    try {
      return await this.getText(this.welcomeMessage);
    } catch {
      return '';
    }
  }
}

module.exports = DashboardPage;
