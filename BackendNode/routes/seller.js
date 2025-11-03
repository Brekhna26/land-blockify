const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // ✅ Use promise version

// Load environment variables
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'landdb-temp',
});

// 🔹 Register land
router.post('/register-land', async (req, res) => {
  const { propertyId, ownerName, location, landArea, propertyType, legalDescription } = req.body;

  try {
    await db.query(
      `INSERT INTO land_properties 
       (propertyId, ownerName, location, landArea, propertyType, legalDescription, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [propertyId, ownerName, location, landArea, propertyType, legalDescription]
    );
    res.status(200).json({ message: "✅ Land registered successfully" });
  } catch (err) {
    console.error("❌ Error inserting land:", err);
    res.status(500).json({ error: "Failed to register land" });
  }
});

// ✅ Fetch all properties by ownerName
router.get("/my-properties", async (req, res) => {
  const ownerName = req.query.ownerName;

  if (!ownerName) {
    return res.status(400).json({ error: "Missing ownerName in query" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM land_properties WHERE ownerName = ?", [ownerName]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching properties:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

module.exports = router;
