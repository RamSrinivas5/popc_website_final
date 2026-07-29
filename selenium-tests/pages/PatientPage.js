// ============================================================
// PATIENT MANAGEMENT PAGE — Page Object Model
// ============================================================
const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');

class PatientPage extends BasePage {
  constructor(driver) {
    super(driver);
    // Patient List
    this.patientListTable = By.css('table.patient-list, .patient-table, [data-testid="patient-table"]');
    this.patientRows = By.css('tbody tr, .patient-row, [data-testid="patient-row"]');
    this.searchInput = By.css('input[type="search"], input[placeholder*="Search"], .search-input');
    this.addPatientBtn = By.css('a[href*="add"], button.add-patient, [data-testid="add-patient"]');
    this.noDataMessage = By.css('.no-data, .empty-state, [data-testid="no-data"]');

    // Add Patient Form
    this.firstNameInput = By.css('input[name="first_name"], #first_name');
    this.lastNameInput = By.css('input[name="last_name"], #last_name');
    this.dobInput = By.css('input[name="date_of_birth"], input[type="date"], #dob');
    this.genderSelect = By.css('select[name="gender"], #gender');
    this.phoneInput = By.css('input[name="phone"], #phone');
    this.emailInput = By.css('input[name="email"], input[type="email"]');
    this.addressInput = By.css('input[name="address"], textarea[name="address"], #address');
    this.diagnosisInput = By.css('input[name="diagnosis"], textarea[name="diagnosis"]');
    this.submitButton = By.css('button[type="submit"], .save-btn, .submit-btn');
    this.cancelButton = By.css('button.cancel, a.cancel, [data-testid="cancel"]');

    // View/Edit Patient
    this.editButton = By.css('button.edit, a[href*="edit"], [data-testid="edit-btn"]');
    this.deleteButton = By.css('button.delete, [data-testid="delete-btn"]');
    this.confirmDeleteButton = By.css('button.confirm-delete, [data-testid="confirm-delete"]');
    this.viewButton = By.css('button.view, a[href*="/patients/"], [data-testid="view-btn"]');

    // Messages
    this.successMessage = By.css('.success-toast, .alert-success, [data-testid="success"]');
    this.errorMessage = By.css('.error-toast, .alert-error, [data-testid="error"]');
    this.loadingSpinner = By.css('.loading-spinner, .spinner');

    // Filters/Pagination
    this.filterDropdown = By.css('select.filter, .filter-select');
    this.paginationNext = By.css('.pagination-next, button[aria-label="Next"]');
    this.paginationPrev = By.css('.pagination-prev, button[aria-label="Previous"]');
    this.pageCount = By.css('.page-count, .pagination-info');
  }

  async openPatientList() {
    await this.navigate(config.routes.patientList);
  }

  async openAddPatient() {
    await this.navigate(config.routes.addPatient);
  }

  async openPatientById(id) {
    await this.navigate(`/patients/${id}`);
  }

  async openEditPatient(id) {
    await this.navigate(`/patients/${id}/edit`);
  }

  async searchPatient(term) {
    await this.type(this.searchInput, term);
    await this.waitForSeconds(1);
  }

  async clearSearch() {
    await this.clearAndType(this.searchInput, '');
  }

  async fillAddPatientForm(data) {
    if (data.firstName) await this.type(this.firstNameInput, data.firstName);
    if (data.lastName) await this.type(this.lastNameInput, data.lastName);
    if (data.dob) await this.type(this.dobInput, data.dob);
    if (data.gender) await this.selectDropdownByText(this.genderSelect, data.gender);
    if (data.phone) await this.type(this.phoneInput, data.phone);
    if (data.email) await this.type(this.emailInput, data.email);
    if (data.address) await this.type(this.addressInput, data.address);
    if (data.diagnosis) await this.type(this.diagnosisInput, data.diagnosis);
  }

  async submitForm() {
    await this.click(this.submitButton);
  }

  async addPatient(data) {
    await this.fillAddPatientForm(data);
    await this.submitForm();
  }

  async getPatientCount() {
    try {
      const rows = await this.findElements(this.patientRows);
      return rows.length;
    } catch {
      return 0;
    }
  }

  async clickFirstEditButton() {
    const btns = await this.findElements(this.editButton);
    if (btns.length > 0) await btns[0].click();
  }

  async clickFirstDeleteButton() {
    const btns = await this.findElements(this.deleteButton);
    if (btns.length > 0) await btns[0].click();
  }

  async confirmDelete() {
    await this.click(this.confirmDeleteButton);
  }

  async getSuccessMessage() {
    try {
      return await this.getText(this.successMessage);
    } catch {
      return '';
    }
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  async isNoDataVisible() {
    return await this.isDisplayed(this.noDataMessage);
  }
}

module.exports = PatientPage;
