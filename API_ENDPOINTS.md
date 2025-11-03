# LandBlockify API Endpoints Documentation

## Base URL
```
http://localhost:3001/api
```

---

## 1. LAND REGISTRATION (Seller)

### Register New Land
**Endpoint:** `POST /register-land`

**Description:** Seller registers a new land property with supporting documents.

**Request:**
```
Content-Type: multipart/form-data

Body:
- propertyId (string): Unique property identifier
- ownerName (string): Owner's full name
- location (string): Property location/address
- landArea (string): Land area in square meters
- propertyType (string): Residential/Commercial/Agricultural
- legalDescription (string): Legal description (optional)
- document (file): PDF/JPG/PNG document
```

**Response (Success):**
```json
{
  "message": "Land registered successfully"
}
```

**Status:** `Pending` (awaiting government verification)

---

## 2. GOVERNMENT APPROVAL

### Get Pending Lands
**Endpoint:** `GET /gov/get-pending-lands`

**Description:** Fetch all lands awaiting government verification.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": "PROP001",
    "ownerName": "John Doe",
    "location": "123 Main Street",
    "landArea": "5000",
    "propertyType": "Residential",
    "legalDescription": "...",
    "documentPath": "/uploads/...",
    "status": "Pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Approve Land & Register on Blockchain
**Endpoint:** `POST /gov/approve-land/:id`

**Description:** Government approves land and registers it on blockchain (Polygon Amoy).

**Requirements:**
- MetaMask wallet must be connected
- Government authority must be logged in

**Request:**
```
No body required
```

**Process:**
1. Connects to MetaMask wallet
2. Registers property on blockchain
3. Updates database status to "Approved"
4. Stores blockchain transaction hash

**Response (Success):**
```json
{
  "message": "Land approved",
  "blockchainTxHash": "0x...",
  "propertyId": "PROP001"
}
```

**Status:** `Approved` (now visible in marketplace)

### Reject Land
**Endpoint:** `POST /gov/reject-land/:id`

**Description:** Government rejects a land registration.

**Response:**
```json
{
  "message": "Land rejected"
}
```

**Status:** `Rejected`

---

## 3. MARKETPLACE (Buyer)

### Get Approved Lands
**Endpoint:** `GET /marketplace/approved-lands`

**Description:** Fetch all approved lands available for purchase.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": "PROP001",
    "ownerName": "John Doe",
    "location": "123 Main Street",
    "landArea": "5000",
    "propertyType": "Residential",
    "documentPath": "/uploads/...",
    "status": "Approved",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## 4. TRANSACTION WORKFLOW

### Stage 1: Buyer Requests to Buy
**Endpoint:** `POST /transactions/request`

**Description:** Buyer sends a purchase request for a property.

**Request:**
```json
{
  "propertyId": "PROP001",
  "buyerEmail": "buyer@example.com",
  "sellerEmail": "seller@example.com"
}
```

**Response:**
```json
{
  "message": "Purchase request submitted"
}
```

**Status:** `Requested`

---

### Stage 2: Get Buy Requests (Seller)
**Endpoint:** `GET /transactions/get-buy-requests?sellerEmail=seller@example.com`

**Description:** Seller views all incoming purchase requests.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": "PROP001",
    "buyerEmail": "buyer@example.com",
    "sellerEmail": "seller@example.com",
    "status": "Requested",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Stage 3: Seller Accepts Request
**Endpoint:** `POST /transactions/accept`

**Description:** Seller accepts a buyer's purchase request.

**Request:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "message": "Accepted"
}
```

**Status:** `Accepted`

---

### Stage 4: Seller Rejects Request
**Endpoint:** `POST /transactions/reject`

**Description:** Seller rejects a buyer's purchase request.

**Request:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "message": "Rejected"
}
```

**Status:** `Rejected`

---

### Stage 5: Get Transactions for Government
**Endpoint:** `GET /transactions/government`

**Description:** Government views all accepted transactions ready for approval.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": "PROP001",
    "buyerEmail": "buyer@example.com",
    "sellerEmail": "seller@example.com",
    "status": "Accepted",
    "location": "123 Main Street",
    "landArea": "5000",
    "propertyType": "Residential",
    "ownerName": "John Doe"
  }
]
```

---

### Stage 6: Government Approves Transaction
**Endpoint:** `POST /transactions/approve-transaction/:id`

**Description:** Government authority approves a transaction. Updates status from "Accepted" to "Government Approved".

**Request:**
```
No body required
```

**Response:**
```json
{
  "message": "Transaction approved by government"
}
```

**Status:** `Government Approved` (ready for blockchain finalization)

---

### Stage 7: Finalize Blockchain Transaction
**Endpoint:** `POST /transactions/finalize-blockchain/:id`

**Description:** Execute property transfer on blockchain. Updates status from "Government Approved" to "Completed".

**Request:**
```json
{
  "blockchainTxHash": "0x..."
}
```

**Response:**
```json
{
  "message": "Blockchain transaction completed"
}
```

**Status:** `Completed` (transaction finalized on blockchain)

---

### Reject Transaction
**Endpoint:** `POST /transactions/reject-transaction/:id`

**Description:** Reject a transaction at any stage (Requested, Accepted, or Government Approved).

**Request:**
```
No body required
```

**Response:**
```json
{
  "message": "Transaction rejected"
}
```

**Status:** `Rejected`

---

### Get All Transactions (Admin)
**Endpoint:** `GET /transactions/admin/transactions`

**Description:** Admin views all transactions with property details.

**Response:**
```json
[
  {
    "id": 1,
    "propertyId": "PROP001",
    "buyerEmail": "buyer@example.com",
    "sellerEmail": "seller@example.com",
    "status": "Completed",
    "blockchain_tx_hash": "0x...",
    "location": "123 Main Street",
    "landArea": "5000",
    "propertyType": "Residential",
    "ownerName": "John Doe"
  }
]
```

---

## 5. TRANSACTION STATUS FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSACTION LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

Requested
   ↓
   ├─→ [Seller Rejects] → Rejected ✗
   │
   ↓
Accepted
   ↓
   ├─→ [Seller Rejects] → Rejected ✗
   │
   ↓
Government Approved
   ↓
   ├─→ [Government Rejects] → Rejected ✗
   │
   ↓
Completed (Blockchain Finalized) ✅
```

---

## 6. ERROR RESPONSES

### 404 Not Found
```json
{
  "message": "Transaction not found"
}
```

### 400 Bad Request
```json
{
  "error": "No file uploaded"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 7. AUTHENTICATION

All endpoints require user to be logged in. User email is retrieved from:
- `localStorage.getItem('email')` (Frontend)
- Query parameters or request body (Backend)

---

## 8. DATABASE SCHEMA

### transactions table
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId VARCHAR(255),
  buyerEmail VARCHAR(255),
  sellerEmail VARCHAR(255),
  status VARCHAR(50), -- Requested, Accepted, Government Approved, Completed, Rejected
  blockchain_tx_hash VARCHAR(255),
  paymentProofPath VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### land_properties table
```sql
CREATE TABLE land_properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId VARCHAR(255) UNIQUE,
  ownerName VARCHAR(255),
  location VARCHAR(255),
  landArea VARCHAR(50),
  propertyType VARCHAR(50),
  legalDescription TEXT,
  documentPath VARCHAR(255),
  status VARCHAR(50), -- Pending, Approved, Rejected
  blockchain_tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. BLOCKCHAIN INTEGRATION

### Polygon Amoy Testnet
- **Chain ID:** 80002
- **RPC URL:** https://rpc-amoy.polygon.technology/
- **Currency:** POL
- **Block Explorer:** https://www.oklink.com/amoy

### Smart Contracts
- **LandRegistry:** 0x7f9dda378bbebb99038be1bd7830663d5d90ba47
- **PropertyTransfer:** 0x76ff87120de0ddcdb09fac0052de6ee6da383012

### Blockchain Operations
1. **Land Registration:** Government registers property on blockchain
2. **Property Transfer:** Execute property transfer from seller to buyer
3. **Verification:** Verify ownership and transaction authenticity

---

## 10. TESTING THE WORKFLOW

### Test Sequence
```bash
# 1. Seller registers land
POST /register-land

# 2. Government approves and registers on blockchain
POST /gov/approve-land/:id

# 3. Buyer views marketplace
GET /marketplace/approved-lands

# 4. Buyer requests to buy
POST /transactions/request

# 5. Seller accepts request
POST /transactions/accept

# 6. Government approves transaction
POST /transactions/approve-transaction/:id

# 7. Finalize on blockchain
POST /transactions/finalize-blockchain/:id
```

---

## 11. SECURITY CONSIDERATIONS

✅ **Password Hashing:** All passwords hashed with bcrypt (salt rounds: 10)
✅ **Wallet Verification:** Government must connect MetaMask wallet
✅ **Transaction Verification:** Blockchain ensures authenticity
✅ **Access Control:** Role-based permissions enforced
✅ **Document Storage:** Secure file upload and storage

---

## 12. FUTURE ENHANCEMENTS

- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced search and filters
- [ ] Property valuation API
- [ ] Insurance integration
- [ ] Dispute resolution system
- [ ] Title insurance
