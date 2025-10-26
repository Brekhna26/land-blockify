// Load environment variables first
require('dotenv').config();

const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 3001;
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const settingsRoutes = require("./routes/settings");
app.use("/api/settings", settingsRoutes);
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);
// MySQL connection using environment variables
console.log('📊 Database Configuration:');
console.log(`Host: ${process.env.DB_HOST || '127.0.0.1'}`);
console.log(`Port: ${process.env.DB_PORT || 3306}`);
console.log(`User: ${process.env.DB_USER || 'root'}`);
console.log(`Database: ${process.env.DB_NAME || 'landdb-temp'}`);

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'landdb-temp',
  acquireTimeout: 60000,
  connectTimeout: 60000
});
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

const dbPromise = db.promise();

// ROUTES
const transactionRoutes = require("./routes/transactions");
app.use("/api/transactions", transactionRoutes);
const chatRoutes = require("./routes/chat");
app.use("/api/messages", chatRoutes);

// ✅ Blockchain routes
const blockchainRoutes = require('./routes/blockchain');
app.use('/api/blockchain', blockchainRoutes);

// ✅ Route for audio message upload
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}.webm`);
  },
});

const audioUpload = multer({ storage: audioStorage });

// ✅ ADD THIS: Seller routes middleware
const sellerRoutes = require("./routes/seller");
app.use("/api/seller", sellerRoutes); // ✅ VERY IMPORTANT

// ======================= Dispute Resolution =======================
app.put("/api/disputes/resolve/:id", (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;

  const sql = `
    INSERT INTO disputes (id, propertyId, subject, resolution, status)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      resolution = VALUES(resolution),
      status = VALUES(status)
  `;

  const propertyId =
    id === "disp_001"
      ? "PROP001"
      : id === "disp_002"
      ? "PROP005"
      : id === "disp_003"
      ? "PROP010"
      : "";
  const subject =
    id === "disp_001"
      ? "Boundary Dispute"
      : id === "disp_002"
      ? "Ownership Claim"
      : id === "disp_003"
      ? "Access Rights Violation"
      : "";

  if (!propertyId || !subject) {
    return res.status(400).json({ error: "Invalid dispute ID" });
  }

  db.query(
    sql,
    [id, propertyId, subject, resolution, "Resolved"],
    (err, result) => {
      if (err) {
        console.error("❌ Failed to update dispute:", err);
        return res.status(500).json({ error: "Failed to save dispute" });
      }
      res.json({ message: "✅ Dispute resolved and saved" });
    }
  );
});

// ======================= Account APIs =======================
app.post("/api/create-account", async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql =
      "INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [fullName, email, hashedPassword, role], (err) => {
      if (err) {
        console.error("❌ MySQL insert error:", err);
        return res.status(500).json({ error: "Registration failed." });
      }
      res.status(200).json({ message: "Account created successfully" });
    });
  } catch (error) {
    console.error("❌ Password hashing error:", error);
    return res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, find the user by email only
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Server error during login" });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0];
      
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Login successful
      res.status(200).json({
        message: "Login successful",
        email: user.email,
        role: user.role,
      });
    });
  } catch (error) {
    console.error("❌ Password verification error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// ======================= Profile APIs =======================
app.get("/api/profile/get-bio", (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query(
    "SELECT fullName, bio FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching bio:", err.message);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });

      res.json({ fullName: results[0].fullName, bio: results[0].bio });
    }
  );
});

app.put("/api/profile/update", (req, res) => {
  const { email, bio } = req.body;
  if (!email || !bio) {
    return res.status(400).json({ error: "Email and bio are required" });
  }

  db.query("UPDATE users SET bio = ? WHERE email = ?", [bio, email], (err) => {
    if (err) {
      console.error("❌ MySQL update error:", err);
      return res.status(500).json({ error: "Failed to update bio" });
    }
    res.status(200).json({ message: "Bio updated successfully" });
  });
});

// ======================= Land Registration =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

app.post("/api/register-land", upload.single("document"), (req, res) => {
  const {
    propertyId,
    ownerName,
    location,
    landArea,
    propertyType,
    legalDescription,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const documentPath = `/uploads/${req.file.filename}`;
  const sql = `
    INSERT INTO land_properties 
    (propertyId, ownerName, location, landArea, propertyType, legalDescription, documentPath, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      propertyId,
      ownerName,
      location,
      landArea,
      propertyType,
      legalDescription,
      documentPath,
      "Pending",
    ],
    (err) => {
      if (err) {
        console.error("❌ DB Insert Error:", err);
        return res.status(500).json({ error: "Failed to register land" });
      }
      res.status(200).json({ message: "Land registered successfully" });
    }
  );
});

// ======================= Government Approval =======================
app.get("/api/gov/get-pending-lands", (req, res) => {
  db.query(
    "SELECT * FROM land_properties WHERE status = 'Pending'",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

app.post("/api/gov/approve-land/:id", (req, res) => {
  const landId = req.params.id;
  db.query(
    "UPDATE land_properties SET status = 'Approved' WHERE id = ?",
    [landId],
    (err) => {
      if (err) return res.status(500).json({ error: "Approval failed" });
      res.json({ message: "Land approved" });
    }
  );
});

app.post("/api/gov/reject-land/:id", (req, res) => {
  const landId = req.params.id;
  db.query(
    "UPDATE land_properties SET status = 'Rejected' WHERE id = ?",
    [landId],
    (err) => {
      if (err) return res.status(500).json({ error: "Rejection failed" });
      res.json({ message: "Land rejected" });
    }
  );
});

// ======================= Marketplace APIs =======================
app.get("/api/marketplace/approved-lands", (req, res) => {
  db.query(
    "SELECT * FROM land_properties WHERE status = 'Approved'",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

app.get("/api/marketplace/admin-lands", (req, res) => {
  db.query(
    "SELECT * FROM land_properties WHERE status IN ('Approved', 'Rejected')",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// ======================= Admin Stats =======================
app.get("/api/admin/get-stats", async (req, res) => {
  try {
    const [users] = await dbPromise.query(
      "SELECT COUNT(*) as total FROM users"
    );
    const [properties] = await dbPromise.query(
      "SELECT COUNT(*) as total FROM land_properties"
    );
    const [buyers] = await dbPromise.query(
      "SELECT COUNT(*) as total FROM users WHERE role='Buyer'"
    );
    const [sellers] = await dbPromise.query(
      "SELECT COUNT(*) as total FROM users WHERE role='Seller'"
    );
    const [authorities] = await dbPromise.query(
      "SELECT COUNT(*) as total FROM users WHERE role='Authority'"
    );

    res.json({
      totalUsers: users[0].total,
      propertiesRegistered: properties[0].total,
      transactionsProcessed: 0,
      userRoles: {
        buyers: buyers[0].total,
        sellers: sellers[0].total,
        authorities: authorities[0].total,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================= Start Server =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
