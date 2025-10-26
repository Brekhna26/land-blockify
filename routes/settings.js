const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

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

// Save settings (POST)
router.post('/', async (req, res) => {
  const { email, emailNotifications, pushNotifications, twoFactorAuth } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if settings already exist
    const [rows] = await db.query('SELECT * FROM user_settings WHERE user_email = ?', [email]);

    if (rows.length > 0) {
      // Update
      await db.query(
        `UPDATE user_settings 
         SET email_notifications = ?, push_notifications = ?, two_factor_auth = ?
         WHERE user_email = ?`,
        [emailNotifications, pushNotifications, twoFactorAuth, email]
      );
    } else {
      // Insert
      await db.query(
        `INSERT INTO user_settings 
         (user_email, email_notifications, push_notifications, two_factor_auth) 
         VALUES (?, ?, ?, ?)`,
        [email, emailNotifications, pushNotifications, twoFactorAuth]
      );
    }

    res.status(200).json({ message: 'Settings saved successfully' });
  } catch (err) {
    console.error('❌ Error saving settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
