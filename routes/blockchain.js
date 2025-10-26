const express = require('express');
const router = express.Router();
const {
  registerPropertyOnBlockchain,
  approvePropertyOnBlockchain,
  createTransferTransactionOnBlockchain,
  getPropertyFromBlockchain,
  verifyOwnershipOnBlockchain,
  getBlockchainStats,
  generateDocumentHash,
  isValidWalletAddress
} = require('../utils/blockchain');

// Middleware to validate wallet address
const validateWalletAddress = (req, res, next) => {
  const { walletAddress } = req.body;
  if (walletAddress && !isValidWalletAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }
  next();
};

/**
 * @route POST /api/blockchain/register-property
 * @desc Register property on blockchain
 * @access Private (Government Authority)
 */
router.post('/register-property', validateWalletAddress, async (req, res) => {
  try {
    const {
      propertyId,
      ownerWalletAddress,
      location,
      landArea,
      propertyType,
      legalDescription,
      documentPath
    } = req.body;

    // Validate required fields
    if (!propertyId || !ownerWalletAddress || !location || !landArea) {
      return res.status(400).json({
        error: 'Missing required fields: propertyId, ownerWalletAddress, location, landArea'
      });
    }

    // Generate document hash if document path is provided
    let documentHash = null;
    if (documentPath) {
      documentHash = generateDocumentHash(documentPath);
    }

    const propertyData = {
      propertyId,
      ownerWalletAddress,
      location,
      landArea: parseInt(landArea),
      propertyType: propertyType || 'Residential',
      legalDescription: legalDescription || '',
      documentHash: documentHash || 'QmHash...'
    };

    // Register on blockchain
    const blockchainResult = await registerPropertyOnBlockchain(propertyData);

    if (blockchainResult.success) {
      // TODO: Update database with blockchain transaction details
      // Example:
      // await db.query(
      //   'UPDATE land_properties SET blockchain_property_id = ?, blockchain_tx_hash = ?, document_hash = ? WHERE propertyId = ?',
      //   [blockchainResult.blockchainPropertyId, blockchainResult.transactionHash, documentHash, propertyId]
      // );

      res.json({
        success: true,
        message: 'Property registered on blockchain successfully',
        transactionHash: blockchainResult.transactionHash,
        blockchainPropertyId: blockchainResult.blockchainPropertyId,
        gasUsed: blockchainResult.gasUsed
      });
    } else {
      res.status(500).json({
        error: 'Failed to register property on blockchain',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error in blockchain property registration:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/approve-property
 * @desc Approve property on blockchain
 * @access Private (Government Authority)
 */
router.post('/approve-property', async (req, res) => {
  try {
    const { blockchainPropertyId } = req.body;

    if (!blockchainPropertyId) {
      return res.status(400).json({
        error: 'Missing required field: blockchainPropertyId'
      });
    }

    // Approve on blockchain
    const blockchainResult = await approvePropertyOnBlockchain(blockchainPropertyId);

    if (blockchainResult.success) {
      // TODO: Update database with approval transaction details
      // Example:
      // await db.query(
      //   'UPDATE land_properties SET approval_tx_hash = ?, status = ? WHERE blockchain_property_id = ?',
      //   [blockchainResult.transactionHash, 'Approved', blockchainPropertyId]
      // );

      res.json({
        success: true,
        message: 'Property approved on blockchain successfully',
        transactionHash: blockchainResult.transactionHash,
        gasUsed: blockchainResult.gasUsed
      });
    } else {
      res.status(500).json({
        error: 'Failed to approve property on blockchain',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error in blockchain property approval:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/create-transfer
 * @desc Create property transfer transaction on blockchain
 * @access Private (Property Owner)
 */
router.post('/create-transfer', validateWalletAddress, async (req, res) => {
  try {
    const {
      blockchainPropertyId,
      buyerWalletAddress,
      price,
      terms
    } = req.body;

    if (!blockchainPropertyId || !buyerWalletAddress || !price) {
      return res.status(400).json({
        error: 'Missing required fields: blockchainPropertyId, buyerWalletAddress, price'
      });
    }

    const transactionData = {
      blockchainPropertyId,
      buyerWalletAddress,
      price: parseFloat(price),
      terms: terms || 'Property transfer transaction'
    };

    // Create transfer transaction on blockchain
    const blockchainResult = await createTransferTransactionOnBlockchain(transactionData);

    if (blockchainResult.success) {
      // TODO: Update database with transfer transaction details
      // Example:
      // await db.query(
      //   'INSERT INTO property_transfers (blockchain_transaction_id, blockchain_tx_hash, property_id, buyer_wallet, seller_wallet, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      //   [blockchainResult.blockchainTransactionId, blockchainResult.transactionHash, blockchainPropertyId, buyerWalletAddress, req.user.walletAddress, price, 'Pending']
      // );

      res.json({
        success: true,
        message: 'Transfer transaction created on blockchain successfully',
        transactionHash: blockchainResult.transactionHash,
        blockchainTransactionId: blockchainResult.blockchainTransactionId,
        gasUsed: blockchainResult.gasUsed
      });
    } else {
      res.status(500).json({
        error: 'Failed to create transfer transaction on blockchain',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error in blockchain transfer creation:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/property/:blockchainPropertyId
 * @desc Get property details from blockchain
 * @access Public
 */
router.get('/property/:blockchainPropertyId', async (req, res) => {
  try {
    const { blockchainPropertyId } = req.params;

    if (!blockchainPropertyId) {
      return res.status(400).json({
        error: 'Missing blockchain property ID'
      });
    }

    // Get property from blockchain
    const blockchainResult = await getPropertyFromBlockchain(blockchainPropertyId);

    if (blockchainResult.success) {
      res.json({
        success: true,
        property: blockchainResult.property
      });
    } else {
      res.status(404).json({
        error: 'Property not found on blockchain',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error getting property from blockchain:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/verify-ownership
 * @desc Verify property ownership on blockchain
 * @access Public
 */
router.post('/verify-ownership', validateWalletAddress, async (req, res) => {
  try {
    const { blockchainPropertyId, ownerAddress } = req.body;

    if (!blockchainPropertyId || !ownerAddress) {
      return res.status(400).json({
        error: 'Missing required fields: blockchainPropertyId, ownerAddress'
      });
    }

    // Verify ownership on blockchain
    const blockchainResult = await verifyOwnershipOnBlockchain(blockchainPropertyId, ownerAddress);

    if (blockchainResult.success) {
      res.json({
        success: true,
        isOwner: blockchainResult.isOwner,
        message: blockchainResult.isOwner ? 'Ownership verified' : 'Ownership not verified'
      });
    } else {
      res.status(500).json({
        error: 'Failed to verify ownership on blockchain',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error verifying ownership on blockchain:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route GET /api/blockchain/stats
 * @desc Get blockchain statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Get blockchain stats
    const blockchainResult = await getBlockchainStats();

    if (blockchainResult.success) {
      res.json({
        success: true,
        stats: blockchainResult.stats
      });
    } else {
      res.status(500).json({
        error: 'Failed to get blockchain statistics',
        details: blockchainResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error getting blockchain stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * @route POST /api/blockchain/validate-address
 * @desc Validate wallet address format
 * @access Public
 */
router.post('/validate-address', (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'Missing address field'
      });
    }

    const isValid = isValidWalletAddress(address);

    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Valid wallet address' : 'Invalid wallet address format'
    });
  } catch (error) {
    console.error('❌ Error validating wallet address:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
