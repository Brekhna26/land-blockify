const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout',authController.logoutUser);
router.post('/update-profile', authController.updateProfile);
router.get('/get-profile', authController.getUserProfile)
// GET seller requests
router.get('/seller-requests', async (req, res) => {
  const { sellerEmail } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE sellerEmail = ? AND status = "Requested"',
      [sellerEmail]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching seller requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});
router.post('/accept', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE transactions SET status = "Accepted" WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Failed to accept" });
  }
});

router.post('/reject', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE transactions SET status = "Rejected" WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject" });
  }
});


module.exports = router;
