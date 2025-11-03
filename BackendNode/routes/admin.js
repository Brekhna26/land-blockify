const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

// ✅ MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'landdb-temp',
});

// ✅ Fetch all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update user status
router.patch('/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
