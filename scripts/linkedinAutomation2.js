import { env } from "../config/envConfig.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the directory to store screenshots
const screenshotsDir = path.join(__dirname, "screenshots");

// Ensure the directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

const LINKEDIN_EMAIL = env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = env.LINKEDIN_PASSWORD;
const LINKEDIN_PROFILE_URL = env.LINKEDIN_PROFILE_URL;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomNumber() {
  return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

async function takeScreenshot(page, io) {
  console.log("Taking screenshot...");
  // Generate a unique filename for each screenshot
  const timestamp = Date.now();
  const screenshotPath = path.join(
    screenshotsDir,
    `screenshot-${timestamp}.png`
  );

  // Capture the screenshot and save it to the file system
  await page.screenshot({ path: screenshotPath });

  // Read the screenshot as a Base64-encoded string
  const screenshotBuffer = fs.readFileSync(screenshotPath);
  const screenshotBase64 = screenshotBuffer.toString("base64");

  // Emit the screenshot to the frontend
  io.emit("screenshot", `data:image/png;base64,${screenshotBase64}`);

  console.log(`Screenshot saved: ${screenshotPath}`);
}

// async function takeScreenshot(page, io) {
//   const screenshotBuffer = await page.screenshot();
//   const screenshotBase64 = screenshotBuffer.toString("base64");
//   io.emit("screenshot", `data:image/png;base64,${screenshotBase64}`);
// }

export async function automateLinkedInUpdate(page, io) {
  try {
    console.log("Email:", LINKEDIN_EMAIL);
    console.log("Password:", LINKEDIN_PASSWORD);
    console.log("LINKEDIN_PROFILE_URL:", LINKEDIN_PROFILE_URL);

    io.emit("status", "Navigating to LinkedIn login page...");
    console.log("Navigating to LinkedIn login page...");
    await page.goto("https://www.linkedin.com/login");
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "Entering email and password...");
    console.log("Entering email and password...");
    await page.type("#username", LINKEDIN_EMAIL);
    await page.type("#password", LINKEDIN_PASSWORD);
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "Submitting login form...");
    console.log("Submitting login form...");
    await page.click(".btn__primary--large");
    await page.waitForNavigation();
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "Navigating to profile page...");
    console.log("Navigating to profile page...");
    await page.goto(LINKEDIN_PROFILE_URL, { waitUntil: "load" });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "Opening 'Edit intro' section...");
    console.log("Opening 'Edit intro' section...");
    await page.evaluate(() => {
      const editButton = document.querySelector(
        'button[aria-label="Edit intro"]'
      );
      if (editButton) {
        editButton.click();
      } else {
        throw new Error("Edit intro button not found");
      }
    });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "LinkedIn profile update complete.");
    console.log("Waiting for profile edit modal to appear...");
    await page.waitForSelector('button[data-view-name="profile-form-save"]', {
      timeout: 60000,
    });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    io.emit("status", "LinkedIn profile update complete.");
    console.log("Clicking 'Save' button...");
    await page.evaluate(() => {
      const saveButton = document.querySelector(
        'button[data-view-name="profile-form-save"]'
      );
      if (saveButton) {
        saveButton.click();
      } else {
        throw new Error("Save button not found");
      }
    });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));
    await takeScreenshot(page, io);

    console.log("LinkedIn profile update complete.");
    io.emit("status", "LinkedIn profile update complete.");
  } catch (error) {
    console.error("Error during LinkedIn automation:", error);
    io.emit("status", `Error: ${error.message}`);
  }
}
