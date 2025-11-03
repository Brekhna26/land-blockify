const db = require('../config/db'); // This should correctly point to your MySQL DB config

// ✅ User Registration Controller
exports.registerUser = (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Database error:', checkErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const insertQuery = 'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [fullName, email, password, role], (insertErr, result) => {
      if (insertErr) {
        console.error('Database error:', insertErr);
        return res.status(500).json({ error: 'Failed to register user' });
      }

      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

// ✅ User Login Controller
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // ⚠️ Use JWT in real applications (here is just a dummy token)
    const token = 'dummy-token';

    // ✅ Respond with necessary data for frontend
    res.json({
      message: 'Login successful',
      token,
      email: user.email,
      role: user.role,
    });
  });
};
