# LandBlockify - Land Registry Management System

A full-stack blockchain-based land registry management system with role-based dashboards for Sellers, Buyers, Government Authorities, and Admins. Built with React, Node.js, MySQL, and Polygon blockchain integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Workflow](#workflow)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## 🎯 Overview

LandBlockify is a comprehensive land registry management system that digitizes and secures land property transactions using blockchain technology. The system ensures transparent, immutable, and verifiable land ownership records while maintaining proper government oversight.

**Key Innovation:** Properties are registered on the Polygon Amoy blockchain, ensuring immutable records and transparent transactions.

---

## ✨ Features

### Multi-Role System
- **Sellers** - Register and manage land properties
- **Buyers** - Browse marketplace and request purchases
- **Government Authority** - Verify documents and approve transactions
- **Admin** - View statistics and manage system

### Land Management
- Property registration with document upload
- Government verification and approval
- Blockchain registration for immutability
- Marketplace for approved properties

### Transaction Workflow
- 6-stage transaction process
- Seller acceptance and government approval
- Blockchain-based property transfer
- Complete audit trail

### Security
- Password hashing with bcrypt
- MetaMask wallet integration
- Role-based access control
- Blockchain verification

### Blockchain Integration
- Polygon Amoy testnet integration
- Smart contracts for land registry
- Property transfer transactions
- Immutable transaction records

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **TailwindCSS** - Styling
- **ethers.js** - Blockchain interaction

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL 2** - Database
- **Multer** - File uploads
- **bcrypt** - Password hashing
- **dotenv** - Environment variables

### Blockchain
- **Polygon Amoy Testnet** - Network
- **Solidity** - Smart contracts
- **Hardhat** - Development environment
- **OpenZeppelin** - Contract libraries

---

## 📦 Prerequisites

Before running the application, ensure you have:

### System Requirements
- **Node.js** v16 or higher
- **npm** v8 or higher
- **MySQL** v5.7 or higher
- **Git** (for version control)

### Browser Requirements
- **MetaMask** extension installed
- Modern browser (Chrome, Firefox, Safari, Edge)

### Blockchain Requirements
- **MetaMask wallet** with Polygon Amoy testnet configured
- **Test POL tokens** (for gas fees) - Get from [Polygon Faucet](https://faucet.polygon.technology/)

### Accounts/Services
- MySQL database access
- Polygon Amoy RPC endpoint (provided by default)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone git@github.com:Brekhna26/land-blockify.git
cd land-blockify
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd BackendNode
npm install
cd ..
```

### Step 4: Set Up Database

Create MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE landblockify_db;
USE landblockify_db;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Land properties table
CREATE TABLE land_properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId VARCHAR(255) UNIQUE NOT NULL,
  ownerName VARCHAR(255),
  location VARCHAR(255),
  landArea VARCHAR(50),
  propertyType VARCHAR(50),
  legalDescription TEXT,
  documentPath VARCHAR(255),
  status VARCHAR(50),
  blockchain_tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId VARCHAR(255),
  buyerEmail VARCHAR(255),
  sellerEmail VARCHAR(255),
  status VARCHAR(50),
  blockchain_tx_hash VARCHAR(255),
  paymentProofPath VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender VARCHAR(255),
  receiver VARCHAR(255),
  propertyId VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes table
CREATE TABLE disputes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId VARCHAR(255),
  buyerEmail VARCHAR(255),
  sellerEmail VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration

### Step 1: Frontend Configuration

Create `.env` file in project root:

```bash
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:3001
REACT_APP_BLOCKCHAIN_RPC=https://rpc-amoy.polygon.technology/
REACT_APP_LAND_REGISTRY_ADDRESS=0x7f9dda378bbebb99038be1bd7830663d5d90ba47
REACT_APP_PROPERTY_TRANSFER_ADDRESS=0x76ff87120de0ddcdb09fac0052de6ee6da383012
```

### Step 2: Backend Configuration

Create `.env` file in `BackendNode` directory:

```bash
# Backend Environment Variables
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=landblockify_db

# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
LAND_REGISTRY_ADDRESS=0x7f9dda378bbebb99038be1bd7830663d5d90ba47
PROPERTY_TRANSFER_ADDRESS=0x76ff87120de0ddcdb09fac0052de6ee6da383012
```

### Step 3: MetaMask Setup

1. Open MetaMask extension
2. Click network dropdown
3. Select "Add Network"
4. Configure Polygon Amoy:
   - **Network Name:** Polygon Amoy
   - **RPC URL:** https://rpc-amoy.polygon.technology/
   - **Chain ID:** 80002
   - **Currency:** POL
   - **Block Explorer:** https://www.oklink.com/amoy

---

## ▶️ Running the Application

### Option 1: Run Both Frontend and Backend (Recommended)

**Terminal 1 - Start Backend:**

```bash
cd BackendNode
npm start
```

Expected output:
```
✅ Server running on http://localhost:3001
✅ Database connected
```

**Terminal 2 - Start Frontend:**

```bash
npm start
```

Expected output:
```
✅ Compiled successfully!
✅ App running on http://localhost:3000
```

### Option 2: Run Frontend Only

```bash
npm start
```

**Note:** Backend must be running separately on port 3001

### Option 3: Run Backend Only

```bash
cd BackendNode
npm start
```

**Note:** Frontend must be running separately on port 3000

---

## 📁 Project Structure

```
land-blockify/
├── public/                          # Static files
├── src/
│   ├── components/                  # Reusable components
│   │   ├── Web3Wallet.js
│   │   └── ...
│   ├── pages/
│   │   ├── Landing/                 # Landing page
│   │   ├── Auth/                    # Login/Register
│   │   ├── Seller/                  # Seller dashboard
│   │   │   ├── RegisterLand.js
│   │   │   └── BuyRequests.js
│   │   ├── Buyer/                   # Buyer dashboard
│   │   │   └── Marketplace.js
│   │   ├── Government/              # Government dashboard
│   │   │   ├── DocumentVerification.js
│   │   │   └── BlockchainManagement.js
│   │   └── Admin/                   # Admin dashboard
│   ├── utils/
│   │   ├── web3.js                  # Blockchain utilities
│   │   └── api.js
│   └── App.js
├── BackendNode/
│   ├── routes/
│   │   ├── land.js
│   │   ├── transactions.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── blockchain.js
│   ├── utils/
│   │   └── blockchain.js
│   ├── uploads/                     # File uploads directory
│   ├── server.js
│   ├── package.json
│   └── .env
├── smartcontract/
│   ├── contracts/
│   │   ├── LandRegistry.sol
│   │   └── PropertyTransfer.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── WORKFLOW.md                      # Complete workflow documentation
├── API_ENDPOINTS.md                 # API endpoints documentation
├── IMPLEMENTATION_GUIDE.md          # Implementation guide
├── QUICK_REFERENCE.md               # Quick reference card
├── README.md                        # This file
└── package.json
```

---

## 🔄 Workflow

### 6-Stage Transaction Flow

1. **Seller Registers Land** → Status: `Pending`
2. **Government Approves & Blockchain Registration** → Status: `Approved`
3. **Buyer Requests to Buy** → Transaction: `Requested`
4. **Seller Accepts Request** → Transaction: `Accepted`
5. **Government Approves Transaction** → Transaction: `Government Approved`
6. **Finalize Blockchain Transaction** → Transaction: `Completed`

For detailed workflow information, see `WORKFLOW.md`

---

## 📚 API Documentation

### Available Endpoints

#### Land Registration
- `POST /api/register-land` - Seller registers land
- `GET /api/gov/get-pending-lands` - Government views pending lands
- `POST /api/gov/approve-land/:id` - Government approves & registers on blockchain
- `POST /api/gov/reject-land/:id` - Government rejects land

#### Marketplace
- `GET /api/marketplace/approved-lands` - Buyer views approved lands

#### Transactions
- `POST /api/transactions/request` - Buyer requests to buy
- `GET /api/transactions/get-buy-requests` - Seller views buy requests
- `POST /api/transactions/accept` - Seller accepts request
- `POST /api/transactions/reject` - Seller rejects request
- `GET /api/transactions/government` - Government views accepted transactions
- `POST /api/transactions/approve-transaction/:id` - Government approves transaction
- `POST /api/transactions/finalize-blockchain/:id` - Finalize on blockchain
- `POST /api/transactions/reject-transaction/:id` - Reject transaction

For complete API documentation with examples, see `API_ENDPOINTS.md`

---

## ⛓️ Blockchain Integration

### Network Details
- **Network:** Polygon Amoy Testnet
- **Chain ID:** 80002
- **RPC URL:** https://rpc-amoy.polygon.technology/
- **Currency:** POL (test tokens)
- **Block Explorer:** https://www.oklink.com/amoy

### Smart Contracts
- **LandRegistry:** 0x7f9dda378bbebb99038be1bd7830663d5d90ba47
- **PropertyTransfer:** 0x76ff87120de0ddcdb09fac0052de6ee6da383012

### Getting Test Tokens
1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Enter your MetaMask wallet address
3. Select Polygon Amoy network
4. Request test POL tokens

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check `.env` database credentials
- Ensure database `landblockify_db` exists

### Issue: "Port 3001 already in use"
**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Issue: "MetaMask wallet not connected"
**Solution:**
- Install MetaMask extension
- Create/import wallet
- Switch to Polygon Amoy network
- Click "Connect Wallet" button

### Issue: "Insufficient gas for blockchain transaction"
**Solution:**
- Get test POL tokens from [Polygon Faucet](https://faucet.polygon.technology/)
- Ensure MetaMask has enough balance

### Issue: "CORS error when calling API"
**Solution:**
- Verify backend is running on port 3001
- Check CORS configuration in `BackendNode/server.js`
- Ensure `REACT_APP_API_URL` is correct in `.env`

### Issue: "File upload not working"
**Solution:**
- Ensure `BackendNode/uploads` directory exists
- Check file permissions
- Verify multer configuration in backend

---

## 📝 Default Test Accounts

You can create test accounts with these roles:

### Seller Account
```
Email: seller@example.com
Password: seller123
Role: Seller
```

### Buyer Account
```
Email: buyer@example.com
Password: buyer123
Role: Buyer
```

### Government Account
```
Email: govt@example.com
Password: govt123
Role: Government
```

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Admin
```

---

## 🔐 Security Best Practices

✅ **Always use strong passwords**
✅ **Never share private keys or seed phrases**
✅ **Keep MetaMask wallet secure**
✅ **Use test tokens for development only**
✅ **Verify contract addresses before transactions**
✅ **Enable 2FA on critical accounts**

---

## 📖 Documentation

- **WORKFLOW.md** - Complete workflow overview
- **API_ENDPOINTS.md** - All API endpoints with examples
- **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation guide
- **QUICK_REFERENCE.md** - Quick reference card
- **WORKFLOW_SUMMARY.md** - Executive summary
- **WORKFLOW_DIAGRAM.txt** - Visual ASCII diagram

---

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review documentation files
3. Check backend logs: `BackendNode/` console output
4. Check frontend console: Browser DevTools (F12)
5. Verify blockchain transactions: [Polygon Amoy Explorer](https://www.oklink.com/amoy)

---

## 📄 License

This project is part of the LandBlockify initiative for transparent land registry management.

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Polygon Documentation](https://polygon.technology/developers)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## ✅ Checklist Before First Run

- [ ] Node.js v16+ installed
- [ ] MySQL installed and running
- [ ] Database created with tables
- [ ] `.env` files configured (frontend and backend)
- [ ] MetaMask installed and configured
- [ ] Test POL tokens obtained
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000

---

## 🚀 Quick Start Command

```bash
# Clone repository
git clone git@github.com:Brekhna26/land-blockify.git
cd land-blockify

# Install dependencies
npm install
cd BackendNode && npm install && cd ..

# Configure environment variables
# Edit .env and BackendNode/.env

# Start backend (Terminal 1)
cd BackendNode && npm start

# Start frontend (Terminal 2)
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

**Happy coding! 🎉**
