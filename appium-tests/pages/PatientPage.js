// ============================================================
// PATIENT MANAGEMENT — Appium iOS Page Object Model
// ============================================================
const BaseIOSPage = require('./BasePage');

class PatientIOSPage extends BaseIOSPage {
  constructor() {
    super();
    const els = this.config.elements;
    this.screen = this.byAccessibility(els.patientListScreen);
    this.addBtn = this.byAccessibility(els.addPatientButton);
    this.searchInput = this.byAccessibility(els.searchField);
    this.firstNameInput = this.byAccessibility(els.patientFirstName);
    this.lastNameInput = this.byAccessibility(els.patientLastName);
    this.dobInput = this.byAccessibility(els.patientDOB);
    this.phoneInput = this.byAccessibility(els.patientPhone);
    this.saveBtn = this.byAccessibility(els.savePatientButton);
    this.deleteBtn = this.byAccessibility(els.deletePatientButton);
    this.confirmDeleteBtn = this.byAccessibility(els.confirmDeleteButton);
    this.editBtn = this.byAccessibility(els.editPatientButton);
  }

  async tapAddPatient() {
    await this.tap(this.addBtn);
  }

  async fillPatientForm(data) {
    if (data.firstName) await this.typeText(this.firstNameInput, data.firstName);
    if (data.lastName) await this.typeText(this.lastNameInput, data.lastName);
    if (data.dob) await this.typeText(this.dobInput, data.dob);
    if (data.phone) await this.typeText(this.phoneInput, data.phone);
  }

  async savePatient() {
    await this.tap(this.saveBtn);
  }

  async addPatient(data) {
    await this.tapAddPatient();
    await this.fillPatientForm(data);
    await this.savePatient();
  }

  async searchPatient(term) {
    await this.typeText(this.searchInput, term);
  }
}

module.exports = PatientIOSPage;
