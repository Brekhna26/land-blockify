const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");

// Load environment variables
require('dotenv').config();

// DB connection
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'landdb-temp',
});

// Audio Upload
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `audio-${Date.now()}.webm`),
});
const audioUpload = multer({ storage: audioStorage });

// POST text message
router.post("/", async (req, res) => {
  const { propertyId, senderEmail, message } = req.body;
  try {
    await db.query(
      "INSERT INTO messages (propertyId, senderEmail, message) VALUES (?, ?, ?)",
      [propertyId, senderEmail, message]
    );
    res.status(200).json({ message: "Message sent" });
  } catch (err) {
    console.error("❌ Message insert failed:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET messages
router.get("/", async (req, res) => {
  const { propertyId } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT * FROM messages WHERE propertyId = ? ORDER BY timestamp ASC",
      [propertyId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ POST audio message
router.post("/audio", audioUpload.single("audio"), async (req, res) => {
  const { senderEmail, propertyId } = req.body;

  if (!req.file || !senderEmail || !propertyId) {
    return res.status(400).json({ error: "Missing audio file or required fields" });
  }

  const audioPath = `/uploads/${req.file.filename}`;

  try {
    await db.query(
      "INSERT INTO messages (propertyId, senderEmail, message, type) VALUES (?, ?, ?, ?)",
      [propertyId, senderEmail, audioPath, "audio"]
    );
    res.status(200).json({ message: "✅ Audio message uploaded" });
  } catch (err) {
    console.error("❌ Failed to save audio message:", err);
    res.status(500).json({ error: "Audio upload failed" });
  }
});

module.exports = router;
