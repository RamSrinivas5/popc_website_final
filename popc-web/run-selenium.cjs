const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function runTests() {
  console.log('Starting Selenium tests...');
  
  // Set up headless Chrome options
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');

  let driver;
  const results = {
    tests: []
  };

  const addResult = (name, status, duration, error = null) => {
    results.tests.push({ name, status, duration, error });
  };

  const startTime = Date.now();

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Test 1: Load login page
    let t1Start = Date.now();
    await driver.get('http://127.0.0.1:5173');
    await driver.wait(until.elementLocated(By.tagName('body')), 5000);
    addResult('Load login page', 'passed', Date.now() - t1Start);

    // Test 2: Check page inputs
    let t2Start = Date.now();
    const usernameInput = await driver.findElement(By.css('input[name="username"]'));
    const passwordInput = await driver.findElement(By.css('input[name="password"]'));
    if (usernameInput && passwordInput) {
      addResult('Username and Password fields present', 'passed', Date.now() - t2Start);
    } else {
      addResult('Username and Password fields present', 'failed', Date.now() - t2Start, 'Inputs not found');
    }

    // Test 3: Check title
    let t3Start = Date.now();
    const title = await driver.getTitle();
    addResult(`Verify page title: "${title}"`, 'passed', Date.now() - t3Start);

  } catch (error) {
    console.error('Selenium execution error:', error.message);
    addResult('Selenium Global Run', 'failed', Date.now() - startTime, error.message);
  } finally {
    if (driver) {
      await driver.quit();
    }
    
    // Ensure test-results dir exists
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results');
    }
    
    fs.writeFileSync('./test-results/selenium.json', JSON.stringify(results, null, 2));
    console.log('Selenium tests complete. JSON output written to ./test-results/selenium.json');
  }
}

runTests();
