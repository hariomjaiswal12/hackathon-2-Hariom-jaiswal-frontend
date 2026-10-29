const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkApiTraffic(url) {
  console.log(`\n======================================================`);
  console.log(`CHECKING API CALLS FOR: ${url}`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      const status = res.status();
      const method = res.request().method();
      let body = '';
      try {
        body = await res.text();
      } catch (e) {
        body = '<could not read body>';
      }
      console.log(`[API ${status}] ${method} ${res.url()}`);
      if (status >= 400) {
        console.log(`  ERROR BODY: ${body.slice(0, 300)}`);
      }
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (err) {
    console.error('Nav error:', err.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  await checkApiTraffic('http://localhost:5174/dashboard');
  await checkApiTraffic('http://localhost:5174/company/google');
}

main().catch(console.error);

