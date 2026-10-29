const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnoseUrl(url) {
  console.log(`\n======================================================`);
  console.log(`DIAGNOSING: ${url}`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  const pageErrors = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err.toString() + '\n' + (err.stack || ''));
  });

  const failedRequests = [];
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  try {
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    console.log(`HTTP Status: ${res.status()}`);
    console.log(`Title: "${await page.title()}"`);

    const rootHtml = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        rootExists: !!root,
        rootInnerHTML: root ? root.innerHTML.slice(0, 500) : 'NO_ROOT',
        bodyInnerText: document.body.innerText.slice(0, 500),
        bodyBgColor: window.getComputedStyle(document.body).backgroundColor,
        rootChildrenCount: root ? root.children.length : 0
      };
    });

    console.log('DOM State:', rootHtml);

    if (pageErrors.length > 0) {
      console.log('🔴 PAGE UNCAUGHT ERRORS:');
      pageErrors.forEach(e => console.log('  ', e));
    } else {
      console.log('No pageerror events.');
    }

    if (consoleErrors.length > 0) {
      console.log('🔴 CONSOLE ERRORS:');
      consoleErrors.forEach(e => console.log('  ', e));
    } else {
      console.log('No console.error logs.');
    }

    if (failedRequests.length > 0) {
      console.log('🔴 FAILED REQUESTS:');
      failedRequests.forEach(f => console.log('  ', f));
    }

    console.log('Console Logs Sample (first 10):');
    consoleLogs.slice(0, 10).forEach(l => console.log('  ', l));

  } catch (err) {
    console.error('Navigation Exception:', err.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  await diagnoseUrl('http://localhost:5174/dashboard');
  await diagnoseUrl('http://localhost:5174/company/google');
  await diagnoseUrl('http://localhost:5173/dashboard');
  await diagnoseUrl('http://localhost:5173/company/google');
}

main().catch(console.error);

