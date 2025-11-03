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
// ✅ Get transactions for government approval (Accepted status)
router.get('/government', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT t.*, lp.location, lp.landArea, lp.propertyType, lp.ownerName FROM transactions t JOIN land_properties lp ON t.propertyId = lp.propertyId WHERE t.status = 'Accepted'"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching government transactions:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// ✅ Route to fetch all transactions for government (all statuses)
router.get('/government/transactions', async (req, res) => {
  try {
    const [transactions] = await db.query(
      "SELECT t.*, lp.location, lp.landArea, lp.propertyType, lp.ownerName FROM transactions t JOIN land_properties lp ON t.propertyId = lp.propertyId WHERE t.status IN (?, ?, ?)",
      ['Accepted', 'Government Approved', 'Completed']
    );
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error fetching transactions for government:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Admin: Get all transactions (no filter)
router.get('/admin/transactions', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT t.*, lp.location, lp.landArea, lp.propertyType, lp.ownerName FROM transactions t JOIN land_properties lp ON t.propertyId = lp.propertyId"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error fetching admin transactions:', error);
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

// ✅ Government Approves Transaction (Status: Accepted → Government Approved)
router.post('/approve-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Verify transaction exists and is in Accepted status
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND status = ?',
      [transactionId, 'Accepted']
    );

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not in Accepted status' });
    }

    // Update transaction status to Government Approved
    await db.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['Government Approved', transactionId]
    );

    console.log('✅ Transaction approved by government:', transactionId);
    res.status(200).json({ message: 'Transaction approved by government' });
  } catch (err) {
    console.error('❌ Error approving transaction:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Finalize Blockchain Transaction (Status: Government Approved → Completed)
router.post('/finalize-blockchain/:id', async (req, res) => {
  const transactionId = req.params.id;
  const { blockchainTxHash } = req.body;

  try {
    // Verify transaction exists and is in Government Approved status
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND status = ?',
      [transactionId, 'Government Approved']
    );

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not in Government Approved status' });
    }

    // Update transaction status to Completed and store blockchain tx hash
    await db.query(
      'UPDATE transactions SET status = ?, blockchain_tx_hash = ? WHERE id = ?',
      ['Completed', blockchainTxHash, transactionId]
    );

    console.log('✅ Blockchain transaction finalized:', transactionId);
    res.status(200).json({ message: 'Blockchain transaction completed' });
  } catch (err) {
    console.error('❌ Error finalizing blockchain transaction:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Reject Transaction (Can be rejected at Requested or Accepted stage)
router.post('/reject-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Verify transaction exists
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction status to Rejected
    await db.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['Rejected', transactionId]
    );

    console.log('❌ Transaction rejected:', transactionId);
    res.status(200).json({ message: 'Transaction rejected' });
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