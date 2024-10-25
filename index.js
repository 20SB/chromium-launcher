// Import chrome-launcher and puppeteer
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";

// Helper function to add delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Determine the Chrome path based on environment (AWS vs. Local PC)
function getChromePath() {
  // Use the environment variable if provided
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  // Default paths for different platforms
  const platform = process.platform;
  if (platform === "win32")
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (platform === "darwin")
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (platform === "linux") return "/usr/bin/chromium-browser";

  throw new Error(`Unsupported platform: ${platform}`);
}

(async () => {
  try {
    // Launch Chrome with necessary flags
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        "--headless",
        "--no-sandbox", // Disable sandboxing for compatibility
        "--disable-gpu", // Disable GPU rendering
        "--disable-dev-shm-usage", // Avoid shared memory issues
        "--disable-setuid-sandbox",
      ],
      chromePath: getChromePath(), // Use the dynamic Chrome path
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
