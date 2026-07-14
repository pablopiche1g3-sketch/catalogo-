const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
const server = app.listen(3000, async () => {
  console.log("Server listening on port 3000");
  
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    page.on('requestfailed', request => {
      console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to http://localhost:3000/");
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    console.log("Page loaded. Waiting 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));
    
    await browser.close();
  } catch (err) {
    console.error("Puppeteer error:", err);
  } finally {
    server.close();
  }
});
