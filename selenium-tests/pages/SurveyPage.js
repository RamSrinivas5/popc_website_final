// ============================================================
// SURVEY PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class SurveyPage extends BasePage {
  constructor(driver) {
    super(driver);
    // Survey List
    this.surveyList = By.css('.survey-list, [data-testid="survey-list"]');
    this.surveyItems = By.css('.survey-item, .survey-card, [data-testid="survey-item"]');
    this.startSurveyBtn = By.css('button.start-survey, [data-testid="start-survey"]');
    this.continueSurveyBtn = By.css('button.continue-survey, [data-testid="continue-survey"]');

    // Survey Navigation
    this.nextBtn = By.css('button.next, [data-testid="next-step"]');
    this.prevBtn = By.css('button.prev, [data-testid="prev-step"]');
    this.submitBtn = By.css('button[type="submit"], button.submit-survey');
    this.progressBar = By.css('.progress-bar, [data-testid="progress"]');
    this.stepIndicator = By.css('.step-indicator, .stepper');
    this.sectionTitle = By.css('h2.section-title, .survey-section-title');

    // Demographics Fields
    this.ageInput = By.css('input[name="age"], #age');
    this.weightInput = By.css('input[name="weight"], #weight');
    this.heightInput = By.css('input[name="height"], #height');
    this.bmiDisplay = By.css('.bmi-display, [data-testid="bmi"]');
    this.smokingSelect = By.css('select[name="smoking"], #smoking');

    // Score/Results
    this.scoreDisplay = By.css('.score, .risk-score, [data-testid="score"]');
    this.riskLevel = By.css('.risk-level, [data-testid="risk-level"]');
    this.recommendations = By.css('.recommendations, [data-testid="recommendations"]');

    // Errors/Validation
    this.fieldError = By.css('.field-error, .validation-error');
    this.formError = By.css('.form-error, .alert-error');

    // Completion
    this.completionMessage = By.css('.completion-message, .survey-complete');
    this.viewScoreBtn = By.css('a[href*="score"], button.view-score');
  }

  async openSurveyList() {
    await this.navigate(config.routes.surveys);
  }

  async openSurveyForPatient(patientId) {
    await this.navigate(`/surveys/${patientId}`);
  }

  async openDemographics(patientId) {
    await this.navigate(`/surveys/${patientId}/demographics`);
  }

  async openMedicalHistory(patientId) {
    await this.navigate(`/surveys/${patientId}/medical-history`);
  }

  async openSurgeryFactors(patientId) {
    await this.navigate(`/surveys/${patientId}/surgery-factors`);
  }

  async openPreoperative(patientId) {
    await this.navigate(`/surveys/${patientId}/preoperative`);
  }

  async openPostoperative(patientId) {
    await this.navigate(`/surveys/${patientId}/postoperative`);
  }

  async openAnesthesia(patientId) {
    await this.navigate(`/surveys/${patientId}/anesthesia`);
  }

  async openScore(patientId) {
    await this.navigate(`/surveys/${patientId}/score`);
  }

  async clickNext() {
    await this.click(this.nextBtn);
  }

  async clickPrev() {
    await this.click(this.prevBtn);
  }

  async submit() {
    await this.click(this.submitBtn);
  }

  async getSurveyCount() {
    try {
      const items = await this.findElements(this.surveyItems);
      return items.length;
    } catch {
      return 0;
    }
  }

  async getScore() {
    try {
      return await this.getText(this.scoreDisplay);
    } catch {
      return '';
    }
  }

  async getRiskLevel() {
    try {
      return await this.getText(this.riskLevel);
    } catch {
      return '';
    }
  }

  async getProgressValue() {
    try {
      return await this.getAttribute(this.progressBar, 'value');
    } catch {
      return '0';
    }
  }

  async isCompleted() {
    return await this.isDisplayed(this.completionMessage, 5000);
  }

  async getFieldError() {
    try {
      return await this.getText(this.fieldError);
    } catch {
      return '';
    }
  }
}

module.exports = SurveyPage;
