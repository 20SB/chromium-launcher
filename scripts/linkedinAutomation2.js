import { env } from "../config/envConfig.js";

const LINKEDIN_EMAIL = env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = env.LINKEDIN_PASSWORD;
const LINKEDIN_PROFILE_URL = env.LINKEDIN_PROFILE_URL;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomNumber() {
  return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
}

export async function automateLinkedInUpdate(page, io) {
  try {
    console.log("Email:", LINKEDIN_EMAIL);
    console.log("Password:", LINKEDIN_PASSWORD);
    console.log("LINKEDIN_PROFILE_URL:", LINKEDIN_PROFILE_URL);

    console.log("Navigating to LinkedIn login page...");
    await page.goto("https://www.linkedin.com/login");
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));

    console.log("Entering email and password...");
    await page.type("#username", LINKEDIN_EMAIL);
    await page.type("#password", LINKEDIN_PASSWORD);
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));

    console.log("Submitting login form...");
    await page.click(".btn__primary--large");
    await page.waitForNavigation();
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));

    console.log("Navigating to profile page...");
    await page.goto(LINKEDIN_PROFILE_URL, { waitUntil: "load" });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));

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

    console.log("Waiting for profile edit modal to appear...");
    await page.waitForSelector('button[data-view-name="profile-form-save"]', {
      timeout: 60000,
    });
    io.emit("pageContent", await page.evaluate(() => document.body.innerHTML));

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

    console.log("LinkedIn profile update complete.");
    io.emit("status", "LinkedIn profile update complete.");
  } catch (error) {
    console.error("Error during LinkedIn automation:", error);
    io.emit("status", `Error: ${error.message}`);
  }
}
