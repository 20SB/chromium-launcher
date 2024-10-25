// import chromeLauncher from "chrome-launcher";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core"; // Puppeteer also supports ESM
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    // Launch Chrome with necessary flags
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        "--no-sandbox", // Disable sandboxing for compatibility
        "--disable-gpu", // Disable GPU rendering
        "--disable-dev-shm-usage", // Avoid shared memory issues
        "--disable-setuid-sandbox",
      ],
    });

    console.log(`Chrome launched on port: ${chrome.port}`);

    // Connect Puppeteer to the launched Chrome instance
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`, // Use the port from chrome-launcher
    });

    const page = await browser.newPage();
    await page.goto("https://subbu.cloud/");

    await delay(10000);
    const title = await page.title();
    console.log(`Page Title: ${title}`);

    await browser.disconnect();
    await chrome.kill(); // Clean up
  } catch (error) {
    console.error("Error launching Chrome or Puppeteer:", error);
    process.exit(1); // Optional: exit process with failure status
  }
})();
