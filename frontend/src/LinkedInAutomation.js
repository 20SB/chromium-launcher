// src/LinkedInAutomation.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true,
}); // Connect to your backend server

function LinkedInAutomation() {
  const [status, setStatus] = useState(""); // Track current status messages
  const [pageContent, setPageContent] = useState(""); // Track HTML content

  useEffect(() => {
    // Listen for updates from the server
    socket.on("status", (data) => setStatus(data));
    socket.on("pageContent", (data) => setPageContent(data));

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.off("status");
      socket.off("pageContent");
    };
  }, []);

  const startAutomation = async () => {
    await fetch("http://localhost:3001/start-linkedin-update", {
      method: "POST",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={startAutomation}>Start LinkedIn Automation</button>
      <h3>Status: {status}</h3>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginTop: "20px",
          overflowY: "scroll",
          maxHeight: "400px",
        }}
        dangerouslySetInnerHTML={{ __html: pageContent }}
      />
    </div>
  );
}

export default LinkedInAutomation;
