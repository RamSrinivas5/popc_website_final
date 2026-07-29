// ============================================================
// TEST DATA — POPC Web Application
// Centralized test data for all test scenarios
// ============================================================

const testData = {
  // ── Valid Credentials ──
  validUser: {
    username: process.env.TEST_USERNAME || 'testdoctor',
    password: process.env.TEST_PASSWORD || 'TestPass@123',
    email: 'testdoctor@popc-hospital.com',
  },

  adminUser: {
    username: 'admin',
    password: 'AdminPass@123',
    email: 'admin@popc-hospital.com',
  },

  // ── Registration Data ──
  newUser: {
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: `testdoc_${Date.now()}@popc.com`,
    username: `testdoc${Date.now()}`,
    password: 'SecurePass@2024',
    confirmPassword: 'SecurePass@2024',
    specialty: 'Cardiology',
    hospital: 'POPC General Hospital',
    license: `LIC-${Math.floor(Math.random() * 99999)}`,
  },

  // ── Invalid User (single object) ──
  invalidUser: {
    username: 'wronguser_xyz',
    password: 'WrongPass@999',
    wrongPassword: 'BadPassword123',
    email: 'notvalid@notexist.xyz',
  },

  // ── Edge Case Strings ──
  edgeCases: {
    longString: 'a'.repeat(256),
    specialChars: '!@#$%^&*()_+{}|:<>?',
    sqlInjection: "' OR '1'='1",
    xssString: '<script>alert("xss")</script>',
    unicode: '日本語テスト한국어テスト',
    emptyString: '',
    whitespace: '   ',
    numericString: '12345678',
  },

  // ── Invalid Credentials ──
  invalidCredentials: [
    { username: '', password: '', description: 'Empty credentials' },
    { username: 'wronguser', password: 'wrongpass', description: 'Wrong username/password' },
    { username: 'testdoctor', password: 'wrongpassword', description: 'Correct username, wrong password' },
    { username: 'wronguser', password: 'TestPass@123', description: 'Wrong username, correct password' },
    { username: 'a'.repeat(256), password: 'pass', description: 'Exceeds max length' },
    { username: '<script>alert(1)</script>', password: 'pass', description: 'XSS injection' },
    { username: "' OR '1'='1", password: "' OR '1'='1", description: 'SQL injection' },
  ],

  // ── Patient Data ──
  validPatient: {
    firstName: 'Jane',
    lastName: 'Doe',
    dob: '1980-05-15',
    gender: 'Female',
    phone: '+1-555-0100',
    email: 'jane.doe@example.com',
    address: '123 Main Street, Springfield, IL 62701',
    diagnosis: 'Post-pulmonary care required',
    bloodType: 'A+',
    weight: '65',
    height: '165',
  },

  editedPatient: {
    firstName: 'Jane Updated',
    lastName: 'Doe Updated',
    phone: '+1-555-9999',
    address: '456 Updated Ave, Chicago, IL 60601',
  },

  invalidPatients: [
    { firstName: '', lastName: 'Doe', description: 'Missing first name' },
    { firstName: 'Jane', lastName: '', description: 'Missing last name' },
    { firstName: 'J', lastName: 'D', description: 'Too short names' },
    { firstName: 'Jane', lastName: 'Doe', phone: 'invalid-phone', description: 'Invalid phone' },
    { firstName: 'Jane', lastName: 'Doe', email: 'invalid-email', description: 'Invalid email' },
  ],

  // ── Search Terms ──
  searchTerms: {
    validPatient: 'Jane',
    partialName: 'Jo',
    nonExistent: 'XYZNONEXISTENT123',
    specialChars: '!@#$%',
    numeric: '12345',
    longString: 'a'.repeat(100),
  },

  // ── Survey / Demographics Data ──
  patientDemographics: {
    age: '45',
    weight: '70',
    height: '175',
    bmi: '22.9',
    smokingStatus: 'never',
    alcoholUse: 'none',
    exerciseLevel: 'moderate',
  },

  medicalHistory: {
    hypertension: true,
    diabetes: false,
    heartDisease: false,
    asthma: true,
    previousSurgeries: 'Appendectomy 2015',
    currentMedications: 'Lisinopril 10mg daily',
    allergies: 'Penicillin',
  },

  // ── Passwords ──
  passwords: {
    valid: 'SecurePass@2024',
    weak: 'abc',
    noUppercase: 'securepass@2024',
    noSpecial: 'SecurePass2024',
    noNumber: 'SecurePass@',
    veryLong: 'A@' + 'a'.repeat(100),
  },

  // ── Email Addresses ──
  emails: {
    valid: 'valid@example.com',
    invalid: ['notanemail', 'missing@domain', '@nodomain.com', 'spaces in@email.com'],
  },

  // ── OTP Data ──
  otp: {
    valid: '123456',
    invalid: '000000',
    expired: '999999',
    tooShort: '123',
    tooLong: '1234567',
  },

  // ── Settings Data ──
  settings: {
    newPassword: 'NewSecurePass@2025',
    newUsername: `newuser_${Date.now()}`,
    confirmDelete: 'DELETE',
  },

  // ── Chat Data ──
  chatMessages: [
    'What is the post-pulmonary care protocol?',
    'Tell me about patient recovery timelines',
    'What medications are recommended?',
    '',  // empty message test
    'a'.repeat(1000),  // very long message
  ],
};

module.exports = testData;
