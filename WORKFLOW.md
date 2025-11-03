# LandBlockify Application Workflow

## Overview
This document describes the complete application flow for land registration, buying, and blockchain transaction in LandBlockify.

## Workflow Stages

### Stage 1: Seller Registers Land
**Actor:** Seller
**Process:**
1. Seller navigates to "Register Land" page
2. Fills in property details:
   - Property ID
   - Owner Name (auto-filled from email)
   - Location/Address
   - Land Area
   - Property Type (Residential/Commercial/Agricultural)
   - Legal Description
   - Supporting Document (PDF/JPG/PNG)
3. Submits the form
4. Land is stored in database with status: **"Pending"**

**Database:** `land_properties` table
- Status: `Pending`
- Awaiting government verification

---

### Stage 2: Government Approves Land
**Actor:** Government Authority
**Process:**
1. Government logs in to dashboard
2. Views "Document Verification" page showing all pending lands
3. Reviews property documents
4. Clicks "Approve & Register" button
5. System:
   - Connects to MetaMask wallet
   - Registers property on blockchain (Polygon Amoy)
   - Updates database status to: **"Approved"**
   - Stores blockchain transaction hash

**Database:** `land_properties` table
- Status: `Approved`
- blockchain_tx_hash: Transaction hash from blockchain
- Now visible in marketplace

---

### Stage 3: Buyer Requests to Buy
**Actor:** Buyer
**Process:**
1. Buyer navigates to "Marketplace"
2. Searches and filters approved lands
3. Clicks "View Details" on a property
4. Clicks "Request to Buy" button
5. System creates a transaction record with status: **"Requested"**

**Database:** `transactions` table
- propertyId: ID of the land
- buyerEmail: Buyer's email
- sellerEmail: Seller's email
- status: `Requested`
- Created timestamp

---

### Stage 4: Seller Accepts Buyer Request
**Actor:** Seller
**Process:**
1. Seller navigates to "Buy Requests" page
2. Views all incoming purchase requests
3. Reviews buyer details
4. Clicks "Accept" button to accept the request
5. System updates transaction status to: **"Accepted"**

**Database:** `transactions` table
- status: `Accepted`
- Seller has agreed to sell to this buyer

---

### Stage 5: Government Approves Transaction
**Actor:** Government Authority
**Process:**
1. Government views "Transaction Management" page
2. Sees all accepted transactions (status: "Accepted")
3. Reviews transaction details
4. Clicks "Approve Transaction" button
5. System updates transaction status to: **"Government Approved"**

**Database:** `transactions` table
- status: `Government Approved`
- Ready for blockchain finalization

---

### Stage 6: Final Blockchain Transaction
**Actor:** System (Automated or Manual)
**Process:**
1. System detects transaction with status: "Government Approved"
2. Connects to blockchain (Polygon Amoy)
3. Executes property transfer transaction:
   - Transfers property ownership from seller to buyer
   - Records transaction on blockchain
   - Stores blockchain transaction hash
4. Updates transaction status to: **"Completed"**

**Database:** `transactions` table
- status: `Completed`
- blockchain_tx_hash: Transaction hash from blockchain
- Transaction finalized on blockchain

---

## Transaction Status Flow

```
Requested 
    ↓
Accepted (Seller accepts)
    ↓
Government Approved (Government approves)
    ↓
Completed (Blockchain transaction executed)
```

## Rejection Points

**Seller can reject:**
- Status: `Requested` → `Rejected`

**Government can reject:**
- Status: `Accepted` → `Rejected`

---

## Database Tables

### land_properties
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| propertyId | VARCHAR | Unique property identifier |
| ownerName | VARCHAR | Owner's name |
| location | VARCHAR | Property location |
| landArea | VARCHAR | Land area in sq meters |
| propertyType | VARCHAR | Type (Residential/Commercial/Agricultural) |
| legalDescription | TEXT | Legal description |
| documentPath | VARCHAR | Path to uploaded document |
| status | VARCHAR | Pending/Approved/Rejected |
| blockchain_tx_hash | VARCHAR | Blockchain transaction hash |
| created_at | TIMESTAMP | Registration timestamp |

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| propertyId | VARCHAR | Reference to property |
| buyerEmail | VARCHAR | Buyer's email |
| sellerEmail | VARCHAR | Seller's email |
| status | VARCHAR | Requested/Accepted/Government Approved/Completed/Rejected |
| blockchain_tx_hash | VARCHAR | Blockchain transaction hash |
| created_at | TIMESTAMP | Request timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

## API Endpoints

### Land Registration
- `POST /api/register-land` - Seller registers new land

### Government Approval
- `GET /api/gov/get-pending-lands` - Get all pending lands
- `POST /api/gov/approve-land/:id` - Approve land and register on blockchain
- `POST /api/gov/reject-land/:id` - Reject land

### Marketplace
- `GET /api/marketplace/approved-lands` - Get all approved lands for marketplace

### Transactions
- `POST /api/transactions/request` - Buyer requests to buy
- `GET /api/transactions/get-buy-requests` - Seller views buy requests
- `POST /api/transactions/accept` - Seller accepts request
- `POST /api/transactions/reject` - Seller rejects request
- `GET /api/transactions/government` - Government views transactions
- `POST /api/transactions/approve-transaction/:id` - Government approves transaction
- `POST /api/transactions/finalize-blockchain/:id` - Execute blockchain transfer

---

## Key Features

✅ **Multi-stage approval process** - Ensures proper verification at each stage
✅ **Blockchain integration** - All transactions recorded on Polygon Amoy testnet
✅ **Role-based access** - Sellers, Buyers, and Government have specific permissions
✅ **Document verification** - Government reviews documents before approval
✅ **Immutable records** - Blockchain ensures transaction integrity
✅ **Rejection capability** - Either party can reject at appropriate stages

---

## Security Considerations

1. **Password Hashing** - All passwords hashed with bcrypt
2. **Wallet Verification** - Government authority must connect MetaMask wallet
3. **Transaction Verification** - Blockchain ensures authenticity
4. **Access Control** - Role-based permissions enforced
5. **Document Storage** - Uploaded documents stored securely on server

---

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Dispute resolution system
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Property valuation API
- [ ] Insurance integration
- [ ] Title insurance
