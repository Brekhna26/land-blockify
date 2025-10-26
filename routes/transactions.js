const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'landdb-temp',
});

// Get Buy Requests for Seller
router.get('/get-buy-requests', async (req, res) => {
  const { sellerEmail } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM transactions WHERE sellerEmail = ?', [sellerEmail]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching buy requests:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get Buyer's Own Requests
router.get('/buyer-requests', async (req, res) => {
  const { buyerEmail } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM transactions WHERE buyerEmail = ?', [buyerEmail]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching buyer requests:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get('/government', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE status = 'Payment Received'"
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});
// ✅ Route to fetch all transactions for government
router.get('/government/transactions', async (req, res) => {
  try {
    const [transactions] = await db.query(
      "SELECT * FROM transactions WHERE status IN (?, ?)",
      ['Paid', 'Payment Received']
    );
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions for government:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ✅ Admin: Get all transactions (no filter)
router.get('/admin/transactions', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE status IN ('Approved', 'Rejected')"
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin transactions' });
  }
});



// ✅ Accept Request
router.post('/accept', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE transactions SET status = ? WHERE id = ?', ['Accepted', id]);
    res.status(200).json({ message: 'Accepted' });
  } catch (err) {
    console.error("❌ Accept error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Reject Request
router.post('/reject', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE transactions SET status = ? WHERE id = ?', ['Rejected', id]);
    res.status(200).json({ message: 'Rejected' });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Create new transaction (if needed)
router.post('/request', async (req, res) => {
  const { propertyId, buyerEmail, sellerEmail } = req.body;
  try {
    await db.query(
      'INSERT INTO transactions (propertyId, buyerEmail, sellerEmail, status) VALUES (?, ?, ?, ?)',
      [propertyId, buyerEmail, sellerEmail, 'Requested']
    );
    res.status(200).json({ message: 'Purchase request submitted' });
  } catch (err) {
    console.error("❌ Request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// ✅ Seller marks payment as received
router.post('/mark-payment-received', async (req, res) => {
  const { transactionId } = req.body;

  console.log("📥 Received transactionId in backend:", transactionId);

  try {
    
    await db.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['Paid', transactionId]
    );
    res.status(200).json({ message: '✅ Payment marked as Paid' });
  } catch (err) {
    console.error("❌ Error marking as received:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Seller confirms payment received
// 📁 routes/transactionRoutes.js (or similar file)
router.put('/mark-received/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE transactions SET status = 'Payment Received' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Payment marked as received' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
});
// Approve Transaction
router.put('/approve/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    // 1. Get buyerEmail and propertyId
    const [result] = await db.query(
      'SELECT buyerEmail, propertyId FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { buyerEmail, propertyId } = result[0];

    // 2. Update land owner to buyer
    await db.query(
      'UPDATE land_properties SET owner = ? WHERE id = ?',
      [buyerEmail, propertyId]
    );

    // 3. Update transaction status
    await db.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['Approved', transactionId]
    );

    res.status(200).json({ message: 'Transaction approved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject Transaction
router.delete('/reject/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    await db.query('DELETE FROM transactions WHERE id = ?', [transactionId]);
    res.status(200).json({ message: 'Transaction rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ❌ Reject Transaction - Delete from database
router.delete('/reject/:transactionId', async (req, res) => {
  const { transactionId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction rejected and deleted' });
  } catch (err) {
    console.error('❌ Error rejecting transaction:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/payment_proofs';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ Upload Payment Proof
router.post('/upload-payment', upload.single('paymentProof'), async (req, res) => {
  const { transactionId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const paymentProofPath = '/uploads/payment_proofs/' + req.file.filename;

  try {
    await db.query(
      'UPDATE transactions SET status = ?, paymentProofPath = ? WHERE id = ?',
      ['Paid', paymentProofPath, transactionId]
    );
    res.status(200).json({ message: '✅ Payment proof uploaded successfully' });
  } catch (err) {
    console.error("❌ DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;