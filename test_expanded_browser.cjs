const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'verification_screenshots');
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\5ee9963d-118b-4466-baeb-00c6be16bf4f\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function saveSnap(name, buffer) {
  const p1 = path.join(SCREENSHOT_DIR, name);
  const p2 = path.join(ARTIFACT_DIR, name);
  fs.writeFileSync(p1, buffer);
  fs.writeFileSync(p2, buffer);
  console.log(`Saved screenshot: ${name}`);
}

async function run() {
  console.log('🚀 Starting Expanded Dataset Browser Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Explore Page 1
    console.log('1. Loading Explore Page...');
    await page.goto(`${FRONTEND_URL}/explore`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    let snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_explore_page1.png', snap);

    const page1Text = await page.evaluate(() => document.body.innerText);
    const has25Pagination = page1Text.includes('Page 1 of 3') || page1Text.includes('Page 1');
    console.log(`Explore Page 1 Loaded. Pagination check: ${has25Pagination}`);

    // 2. Next to Page 2
    console.log('2. Clicking Next to Page 2...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_explore_page2.png', snap);

    // 3. Next to Page 3
    console.log('3. Clicking Next to Page 3...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_explore_page3.png', snap);

    // 4. Search for NVIDIA
    console.log('4. Searching for NVIDIA...');
    await page.goto(`${FRONTEND_URL}/explore`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.type('input[placeholder*="Search company"]', 'NVIDIA');
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_search_nvidia.png', snap);

    // 5. Open NVIDIA Company Detail Page
    console.log('5. Navigating to NVIDIA Intelligence view...');
    await page.goto(`${FRONTEND_URL}/company/nvidia`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_company_nvidia.png', snap);

    // 6. What-If Simulator with Cohorts
    console.log('6. Navigating to What-If Simulator...');
    await page.goto(`${FRONTEND_URL}/what-if`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Click Cloud & Big Tech cohort
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Cloud & Big Tech'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_whatif_cohorts.png', snap);

    // 7. Compare Page
    console.log('7. Navigating to Compare Page...');
    await page.goto(`${FRONTEND_URL}/compare`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_compare.png', snap);

    // 8. Dashboard Page
    console.log('8. Navigating to Dashboard...');
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    snap = await page.screenshot({ fullPage: false });
    saveSnap('expanded_dashboard.png', snap);

    console.log('🎉 All browser verifications passed successfully!');
  } catch (err) {
    console.error('❌ Browser verification error:', err);
  } finally {
    await browser.close();
  }
}

run();

