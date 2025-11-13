# LandBlockify Smart Contracts

This directory contains the smart contracts for the LandBlockify land registry system, built for Polygon Mumbai testnet.

## 📋 Overview

The smart contract system consists of two main contracts:

1. **LandRegistry.sol** - Handles land ownership registration and verification
2. **PropertyTransfer.sol** - Manages property sale transactions with escrow

## 🚀 Quick Setup

### Prerequisites

- Node.js (v16 or higher)
- MetaMask wallet with Polygon Mumbai testnet configured
- Test MATIC tokens for deployment and transactions

### 1. Install Dependencies

```bash
cd smartcontract
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Polygon Mumbai Testnet Configuration
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com

# Your wallet private key (NEVER commit this to git)
PRIVATE_KEY=your_private_key_here

# PolygonScan API key for contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### 3. Get Test MATIC

Get test MATIC tokens from the Polygon Mumbai faucet:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://mumbaifaucet.com/)

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Deploy to Mumbai Testnet

```bash
npm run deploy:mumbai
```

After deployment, the contract addresses will be saved in `deployments/mumbai.json`.

### 6. Verify Contracts (Optional)

```bash
# Verify LandRegistry
npx hardhat verify --network mumbai <LAND_REGISTRY_ADDRESS>

# Verify PropertyTransfer
npx hardhat verify --network mumbai <PROPERTY_TRANSFER_ADDRESS> "<LAND_REGISTRY_ADDRESS>"
```

## 📖 Contract Documentation

### LandRegistry Contract

**Main Functions:**

- `registerProperty()` - Register a new land property
- `approveProperty()` - Approve a registered property (authorities only)
- `transferProperty()` - Transfer property ownership
- `getProperty()` - Get property details
- `verifyOwnership()` - Verify property ownership

**Events:**

- `PropertyRegistered` - Emitted when a property is registered
- `PropertyApproved` - Emitted when a property is approved
- `PropertyTransferred` - Emitted when ownership is transferred

### PropertyTransfer Contract

**Main Functions:**

- `createTransaction()` - Create a property sale transaction
- `acceptTransaction()` - Accept transaction and deposit escrow
- `completeTransaction()` - Complete the transaction and transfer property
- `cancelTransaction()` - Cancel a pending transaction
- `raiseDispute()` - Raise a dispute for a transaction

**Events:**

- `TransactionCreated` - Emitted when a transaction is created
- `TransactionAccepted` - Emitted when a buyer accepts and deposits escrow
- `TransactionCompleted` - Emitted when a transaction is completed
- `EscrowDeposited` - Emitted when escrow is deposited
- `EscrowReleased` - Emitted when escrow is released

## 🔧 Integration with Backend

### 1. Update Backend Dependencies

Add to your backend `package.json`:

```json
{
  "dependencies": {
    "ethers": "^5.7.2",
    "dotenv": "^16.3.1"
  }
}
```

### 2. Environment Variables

Add to your backend `.env`:

```env
# Blockchain Configuration
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
LAND_REGISTRY_CONTRACT_ADDRESS=deployed_contract_address
PROPERTY_TRANSFER_CONTRACT_ADDRESS=deployed_contract_address
```

### 3. Database Schema Updates

Add blockchain-related fields to your database tables:

```sql
-- Add to land_properties table
ALTER TABLE land_properties ADD COLUMN blockchain_property_id VARCHAR(255);
ALTER TABLE land_properties ADD COLUMN blockchain_tx_hash VARCHAR(255);
ALTER TABLE land_properties ADD COLUMN owner_wallet_address VARCHAR(42);
ALTER TABLE land_properties ADD COLUMN document_hash VARCHAR(255);

-- Add to transactions table (if you have one)
ALTER TABLE transactions ADD COLUMN blockchain_transaction_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN blockchain_tx_hash VARCHAR(255);
ALTER TABLE transactions ADD COLUMN buyer_wallet_address VARCHAR(42);
ALTER TABLE transactions ADD COLUMN seller_wallet_address VARCHAR(42);
```

## 🔗 Frontend Integration

### 1. Install Web3 Dependencies

Add to your React app:

```bash
npm install ethers
```

### 2. Environment Variables

Add to your React `.env`:

```env
REACT_APP_LAND_REGISTRY_ADDRESS=deployed_contract_address
REACT_APP_PROPERTY_TRANSFER_ADDRESS=deployed_contract_address
REACT_APP_POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
```

### 3. Import Web3 Components

```javascript
import Web3Wallet from './components/Web3Wallet';
import web3Service from './utils/web3';
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Manual Testing

1. Deploy contracts to Mumbai testnet
2. Use the provided utility functions to interact with contracts
3. Test property registration, approval, and transfer flows
4. Verify transactions on [Mumbai PolygonScan](https://mumbai.polygonscan.com/)

## 📁 Project Structure

```
smartcontract/
├── contracts/
│   ├── LandRegistry.sol          # Main land registry contract
│   └── PropertyTransfer.sol      # Property transfer contract
├── scripts/
│   └── deploy.js                 # Deployment script
├── utils/
│   └── blockchain.js             # Blockchain service utilities
├── deployments/
│   └── mumbai.json              # Deployment addresses (generated)
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🔒 Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Access Control**: Only authorized government authorities can approve properties
3. **Escrow Protection**: Funds are held in escrow during transactions
4. **Reentrancy Protection**: Contracts use OpenZeppelin's ReentrancyGuard
5. **Input Validation**: All inputs are validated before processing

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient MATIC**: Make sure you have enough test MATIC for gas fees
2. **Network Issues**: Verify you're connected to Polygon Mumbai testnet
3. **Contract Not Found**: Ensure contracts are deployed and addresses are correct
4. **Transaction Reverted**: Check contract requirements and input validation

### Specific Error: "execution reverted (no data present; likely require(false) occurred)"

This error typically occurs when:

1. **Not Authorized Authority**: Your wallet address is not in the `authorizedAuthorities` mapping
   - **Solution**: The app will automatically add you as an authority on first attempt
   - **Manual Fix**: Call `addAuthority(your_wallet_address)` function

2. **Property Already Registered**: The property identifier already exists in the contract
   - **Solution**: Use a unique property identifier

3. **Invalid Parameters**: Empty strings or invalid values passed to contract
   - **Solution**: Ensure all required fields are filled and valid

### Quick Fix Steps

1. **Check Environment Variables**:
   ```bash
   # Make sure your .env file has correct contract addresses
   REACT_APP_LAND_REGISTRY_ADDRESS=0x7f9dda378bbebb99038be1bd7830663d5d90ba47
   REACT_APP_PROPERTY_TRANSFER_ADDRESS=0x76ff87120de0ddcdb09fac0052de6ee6da383012
   ```

2. **Verify Network Connection**:
   - Connect to Polygon Mumbai testnet (Chain ID: 80001)
   - OR Polygon Amoy testnet (Chain ID: 80002)

3. **Check Authority Status**:
   - The app will automatically check and add your wallet as an authority
   - First transaction may fail, but second attempt should work

4. **Reset and Retry**:
   ```bash
   # Clear browser cache and localStorage
   # Refresh the page and reconnect wallet
   ```

### Debug Steps

1. Open browser console (F12)
2. Look for debug logs starting with:
   - `📝 Debug handleVerify:`
   - `🔍 Checking authority status...`
   - `📋 Authority status:`
3. Check transaction details on [PolygonScan](https://mumbai.polygonscan.com/)

### Getting Help

- Check the [Hardhat documentation](https://hardhat.org/docs)
- Visit [Polygon documentation](https://docs.polygon.technology/)
- Review [OpenZeppelin contracts](https://docs.openzeppelin.com/contracts/)
- Check console logs for specific error details

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Building! 🚀**
