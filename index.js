import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";
import { automateLinkedInUpdate } from "./scripts/linkedinAutomation2.js";
import { browserConfig } from "./config/puppeteerConfig.js";

import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));

const server = app.listen(3001, () =>
  console.log("Server running on port 3001")
);

const io = new Server(server, {
  // Use Server to initialize socket.io
  cors: {
    origin: "*", // Allow requests from frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.post("/start-linkedin-update", async (req, res) => {
  io.emit("status", "Starting LinkedIn automation...");
  try {
    const chrome = await chromeLauncher.launch(browserConfig);
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`,
    });

    const page = await browser.newPage();
    await automateLinkedInUpdate(page, io); // Pass io to automation function

    await browser.disconnect();
    await chrome.kill();

    io.emit("status", "Automation complete.");
    res.json({ success: true });
  } catch (error) {
    io.emit("status", `Error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/dummy-post", async (req, res) => {
  res.json({ success: true, message: "Dummy Post working" });
});

app.get("/", (req, res) => {
  return res.send(`<h1>You are on the Home Page of Auto Updator Server</h1>`);
});
