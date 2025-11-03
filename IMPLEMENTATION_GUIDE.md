# LandBlockify Workflow Implementation Guide

## Quick Start: Complete Workflow

This guide walks through implementing the complete workflow: **Seller Register → Buyer Request → Seller Accept → Government Approve → Blockchain Transaction**

---

## Phase 1: Seller Registers Land

### Frontend: `RegisterLand.js`
```javascript
// Seller fills form and submits
const handleSubmit = async (e) => {
  e.preventDefault();
  const formPayload = new FormData();
  for (const key in formData) {
    formPayload.append(key, formData[key]);
  }

  const res = await fetch("http://localhost:3001/api/register-land", {
    method: "POST",
    body: formPayload,
  });

  if (res.ok) {
    alert("Land Registered Successfully!");
    // Land status: Pending
  }
};
```

### Backend: `server.js`
```javascript
app.post("/api/register-land", upload.single("document"), (req, res) => {
  const { propertyId, ownerName, location, landArea, propertyType, legalDescription } = req.body;
  
  const sql = `
    INSERT INTO land_properties 
    (propertyId, ownerName, location, landArea, propertyType, legalDescription, documentPath, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [...values, "Pending"], (err) => {
    if (err) return res.status(500).json({ error: "Failed to register land" });
    res.status(200).json({ message: "Land registered successfully" });
  });
});
```

**Database State:**
```
land_properties table:
- status: "Pending"
- Awaiting government verification
```

---

## Phase 2: Government Approves & Registers on Blockchain

### Frontend: `DocumentVerification.js`
```javascript
const handleVerify = async (id) => {
  if (!walletConnected) {
    alert('Please connect your MetaMask wallet first!');
    return;
  }

  try {
    // Find property details
    const property = pendingLands.find(land => land.id === id);

    // Prepare blockchain parameters
    const blockchainParams = {
      propertyIdentifier: property.propertyId,
      ownerName: property.ownerName,
      location: property.location,
      landArea: parseInt(property.landArea),
      propertyType: property.propertyType,
      legalDescription: property.legalDescription,
      documentHash: property.documentHash || '0x0000...'
    };

    // Register on blockchain
    const blockchainTx = await registerProperty(blockchainParams);

    if (!blockchainTx.success) {
      throw new Error('Blockchain transaction failed');
    }

    // Approve in database
    await axios.post(`http://localhost:3001/api/gov/approve-land/${id}`);

    // Store blockchain transaction hash
    await axios.post('http://localhost:3001/api/blockchain/register-property', {
      propertyId: property.id,
      transactionHash: blockchainTx.transactionHash,
      blockchainId: blockchainTx.propertyId
    });

    alert(`✅ Property approved and registered on blockchain!`);
    setPendingLands(prev => prev.filter(l => l.id !== id));
  } catch (error) {
    console.error('❌ Error approving property:', error);
    alert(`❌ Failed to approve property!`);
  }
};
```

### Backend: `server.js`
```javascript
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
```

**Database State:**
```
land_properties table:
- status: "Approved"
- blockchain_tx_hash: "0x..."
- Now visible in marketplace
```

**Blockchain State:**
```
LandRegistry contract:
- Property registered with owner name
- Government address stored as registrar
```

---

## Phase 3: Buyer Requests to Buy

### Frontend: `Marketplace.js`
```javascript
const handleBuyRequest = () => {
  axios.post('http://localhost:3001/api/transactions/request', {
    propertyId: selectedProperty.propertyId,
    buyerEmail: buyerEmail,
    sellerEmail: selectedProperty.ownerName
  })
  .then(() => alert("✅ Purchase request sent to seller"))
  .catch(() => alert("❌ Failed to send purchase request"));
};
```

### Backend: `routes/transactions.js`
```javascript
router.post('/request', async (req, res) => {
  const { propertyId, buyerEmail, sellerEmail } = req.body;
  try {
    await db.query(
      'INSERT INTO transactions (propertyId, buyerEmail, sellerEmail, status) VALUES (?, ?, ?, ?)',
      [propertyId, buyerEmail, sellerEmail, 'Requested']
    );
    res.status(200).json({ message: 'Purchase request submitted' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

**Database State:**
```
transactions table:
- status: "Requested"
- Waiting for seller response
```

---

## Phase 4: Seller Accepts Request

### Frontend: `BuyRequests.js`
```javascript
const handleAccept = async (id) => {
  try {
    await axios.post(`http://localhost:3001/api/transactions/accept`, { id });
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: "Accepted" } : req
      )
    );
  } catch (err) {
    console.error("❌ Error accepting request:", err);
  }
};
```

### Backend: `routes/transactions.js`
```javascript
router.post('/accept', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('UPDATE transactions SET status = ? WHERE id = ?', ['Accepted', id]);
    res.status(200).json({ message: 'Accepted' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

**Database State:**
```
transactions table:
- status: "Accepted"
- Seller has agreed to sell
- Ready for government approval
```

---

## Phase 5: Government Approves Transaction

### Frontend: `GovernmentTransactions.js` (Create this component)
```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function GovernmentTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/transactions/government')
      .then(res => setTransactions(res.data))
      .catch(err => console.error("Error fetching transactions:", err));
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:3001/api/transactions/approve-transaction/${id}`);
      setTransactions(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status: "Government Approved" } : t
        )
      );
      alert("✅ Transaction approved by government");
    } catch (err) {
      console.error("Error approving transaction:", err);
      alert("❌ Failed to approve transaction");
    }
  };

  return (
    <div className="government-transactions">
      <h2>Transaction Approvals</h2>
      <table>
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.propertyId}</td>
              <td>{t.buyerEmail}</td>
              <td>{t.sellerEmail}</td>
              <td>{t.status}</td>
              <td>
                {t.status === "Accepted" && (
                  <button onClick={() => handleApprove(t.id)}>
                    ✅ Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Backend: `routes/transactions.js`
```javascript
router.post('/approve-transaction/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND status = ?',
      [transactionId, 'Accepted']
    );

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not in Accepted status' });
    }

    await db.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['Government Approved', transactionId]
    );

    res.status(200).json({ message: 'Transaction approved by government' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

**Database State:**
```
transactions table:
- status: "Government Approved"
- Ready for blockchain finalization
```

---

## Phase 6: Finalize Blockchain Transaction

### Frontend: `BlockchainFinalization.js` (Create this component)
```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeb3Service, createTransaction } from '../utils/web3';

export default function BlockchainFinalization() {
  const [transactions, setTransactions] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/transactions/government/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error("Error fetching transactions:", err));
  }, []);

  const handleFinalize = async (transaction) => {
    if (transaction.status !== 'Government Approved') {
      alert('Transaction must be in Government Approved status');
      return;
    }

    setProcessingId(transaction.id);
    try {
      // Get blockchain property ID from land_properties table
      const [property] = await axios.get(
        `http://localhost:3001/api/land/get-property/${transaction.propertyId}`
      );

      // Create blockchain transaction
      const blockchainTx = await createTransaction({
        blockchainPropertyId: property.blockchain_property_id,
        buyerWalletAddress: transaction.buyerEmail, // Should be buyer's wallet
        price: transaction.price || '1', // Price in MATIC
        terms: `Property transfer for ${transaction.propertyId}`
      });

      if (!blockchainTx.success) {
        throw new Error('Blockchain transaction failed');
      }

      // Update transaction status in database
      await axios.post(
        `http://localhost:3001/api/transactions/finalize-blockchain/${transaction.id}`,
        { blockchainTxHash: blockchainTx.transactionHash }
      );

      alert(`✅ Transaction finalized on blockchain!\nTx: ${blockchainTx.transactionHash}`);
      
      setTransactions(prev =>
        prev.map(t =>
          t.id === transaction.id ? { ...t, status: "Completed" } : t
        )
      );
    } catch (error) {
      console.error('❌ Error finalizing transaction:', error);
      alert(`❌ Failed to finalize transaction: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="blockchain-finalization">
      <h2>Blockchain Transaction Finalization</h2>
      <table>
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.propertyId}</td>
              <td>{t.buyerEmail}</td>
              <td>{t.sellerEmail}</td>
              <td>{t.status}</td>
              <td>
                {t.status === "Government Approved" && (
                  <button 
                    onClick={() => handleFinalize(t)}
                    disabled={processingId === t.id}
                  >
                    {processingId === t.id ? '⏳ Processing...' : '🔗 Finalize'}
                  </button>
                )}
                {t.status === "Completed" && (
                  <span style={{ color: 'green' }}>✅ Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Backend: `routes/transactions.js`
```javascript
router.post('/finalize-blockchain/:id', async (req, res) => {
  const transactionId = req.params.id;
  const { blockchainTxHash } = req.body;

  try {
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND status = ?',
      [transactionId, 'Government Approved']
    );

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or not in Government Approved status' });
    }

    await db.query(
      'UPDATE transactions SET status = ?, blockchain_tx_hash = ? WHERE id = ?',
      ['Completed', blockchainTxHash, transactionId]
    );

    res.status(200).json({ message: 'Blockchain transaction completed' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

**Database State:**
```
transactions table:
- status: "Completed"
- blockchain_tx_hash: "0x..."
- Transaction finalized on blockchain
```

**Blockchain State:**
```
PropertyTransfer contract:
- Property transferred from seller to buyer
- Transaction recorded immutably
```

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LANDBLOCKIFY WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

STAGE 1: SELLER REGISTERS LAND
┌──────────────────────────────┐
│ Seller fills registration    │
│ form with property details   │
│ and uploads document         │
└──────────────────────────────┘
           ↓
    POST /register-land
           ↓
┌──────────────────────────────┐
│ Land stored in database      │
│ Status: PENDING              │
│ Awaiting government review   │
└──────────────────────────────┘


STAGE 2: GOVERNMENT APPROVES & REGISTERS ON BLOCKCHAIN
┌──────────────────────────────┐
│ Government reviews pending   │
│ lands and documents          │
└──────────────────────────────┘
           ↓
    POST /gov/approve-land/:id
           ↓
┌──────────────────────────────┐
│ 1. Connect MetaMask wallet   │
│ 2. Register on blockchain    │
│ 3. Update database status    │
│ 4. Store blockchain tx hash  │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│ Land Status: APPROVED        │
│ Visible in marketplace       │
│ Blockchain registered        │
└──────────────────────────────┘


STAGE 3: BUYER REQUESTS TO BUY
┌──────────────────────────────┐
│ Buyer views marketplace      │
│ and selects property         │
└──────────────────────────────┘
           ↓
    POST /transactions/request
           ↓
┌──────────────────────────────┐
│ Transaction created          │
│ Status: REQUESTED            │
│ Waiting for seller response  │
└──────────────────────────────┘


STAGE 4: SELLER ACCEPTS REQUEST
┌──────────────────────────────┐
│ Seller reviews buy request   │
│ and decides to accept        │
└──────────────────────────────┘
           ↓
    POST /transactions/accept
           ↓
┌──────────────────────────────┐
│ Transaction Status: ACCEPTED │
│ Ready for government review  │
└──────────────────────────────┘


STAGE 5: GOVERNMENT APPROVES TRANSACTION
┌──────────────────────────────┐
│ Government reviews accepted  │
│ transactions and approves    │
└──────────────────────────────┘
           ↓
    POST /transactions/approve-transaction/:id
           ↓
┌──────────────────────────────┐
│ Status: GOVERNMENT APPROVED  │
│ Ready for blockchain         │
│ finalization                 │
└──────────────────────────────┘


STAGE 6: FINALIZE BLOCKCHAIN TRANSACTION
┌──────────────────────────────┐
│ Execute property transfer    │
│ on blockchain (Polygon Amoy) │
└──────────────────────────────┘
           ↓
    POST /transactions/finalize-blockchain/:id
           ↓
┌──────────────────────────────┐
│ 1. Create blockchain tx      │
│ 2. Transfer property         │
│ 3. Store tx hash in DB       │
│ 4. Update status to COMPLETED│
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│ ✅ TRANSACTION COMPLETE      │
│ Property transferred         │
│ Blockchain verified          │
│ Immutable record created     │
└──────────────────────────────┘
```

---

## Testing Checklist

- [ ] Seller can register land (status: Pending)
- [ ] Government can view pending lands
- [ ] Government can approve and register on blockchain (status: Approved)
- [ ] Buyer can view approved lands in marketplace
- [ ] Buyer can request to buy (transaction status: Requested)
- [ ] Seller can view and accept buy requests (status: Accepted)
- [ ] Government can approve transactions (status: Government Approved)
- [ ] Blockchain transaction can be finalized (status: Completed)
- [ ] Seller can reject requests at any stage
- [ ] Government can reject transactions at any stage
- [ ] Blockchain transactions are recorded with tx hash
- [ ] All status transitions are correct

---

## Key Components to Create/Update

1. **GovernmentTransactions.js** - View and approve accepted transactions
2. **BlockchainFinalization.js** - Finalize transactions on blockchain
3. **Update BuyRequests.js** - Add reject functionality
4. **Update DocumentVerification.js** - Ensure blockchain registration works
5. **Update Marketplace.js** - Add buy request functionality

---

## Database Queries

### View all transactions by status
```sql
SELECT * FROM transactions WHERE status = 'Requested';
SELECT * FROM transactions WHERE status = 'Accepted';
SELECT * FROM transactions WHERE status = 'Government Approved';
SELECT * FROM transactions WHERE status = 'Completed';
```

### View transaction with property details
```sql
SELECT t.*, lp.location, lp.landArea, lp.propertyType, lp.ownerName 
FROM transactions t 
JOIN land_properties lp ON t.propertyId = lp.propertyId 
WHERE t.status = 'Accepted';
```

---

## Security Notes

✅ Always verify wallet connection before blockchain operations
✅ Validate transaction status before state transitions
✅ Store blockchain tx hashes for verification
✅ Use bcrypt for password hashing
✅ Implement proper error handling and logging
✅ Add transaction rollback mechanisms if needed
