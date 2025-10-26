const { BlockchainService } = require('../../smartcontract/utils/blockchain');
require('dotenv').config();

// Initialize blockchain service
const blockchainService = new BlockchainService(
  process.env.POLYGON_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
  process.env.PRIVATE_KEY
);

/**
 * Register property on blockchain
 * @param {Object} propertyData - Property data from database
 * @returns {Object} - Blockchain registration result
 */
async function registerPropertyOnBlockchain(propertyData) {
  try {
    console.log('🏠 Registering property on blockchain:', propertyData.propertyId);
    
    const blockchainData = {
      propertyIdentifier: propertyData.propertyId,
      owner: propertyData.ownerWalletAddress || '0x0000000000000000000000000000000000000000',
      location: propertyData.location,
      landArea: parseInt(propertyData.landArea),
      propertyType: propertyData.propertyType,
      legalDescription: propertyData.legalDescription,
      documentHash: propertyData.documentHash || 'QmHash...' // IPFS hash or file hash
    };
    
    const result = await blockchainService.registerProperty(blockchainData);
    
    if (result.success) {
      console.log('✅ Property registered on blockchain:', result.transactionHash);
      return {
        success: true,
        transactionHash: result.transactionHash,
        blockchainPropertyId: result.propertyId,
        gasUsed: result.gasUsed
      };
    } else {
      console.error('❌ Blockchain registration failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error in blockchain registration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Approve property on blockchain
 * @param {string} blockchainPropertyId - Property ID on blockchain
 * @returns {Object} - Blockchain approval result
 */
async function approvePropertyOnBlockchain(blockchainPropertyId) {
  try {
    console.log('✅ Approving property on blockchain:', blockchainPropertyId);
    
    const result = await blockchainService.approveProperty(blockchainPropertyId);
    
    if (result.success) {
      console.log('✅ Property approved on blockchain:', result.transactionHash);
      return {
        success: true,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed
      };
    } else {
      console.error('❌ Blockchain approval failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error in blockchain approval:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create property transfer transaction on blockchain
 * @param {Object} transactionData - Transaction data
 * @returns {Object} - Blockchain transaction result
 */
async function createTransferTransactionOnBlockchain(transactionData) {
  try {
    console.log('💰 Creating transfer transaction on blockchain:', transactionData);
    
    const result = await blockchainService.createTransaction(
      transactionData.blockchainPropertyId,
      transactionData.buyerWalletAddress,
      transactionData.price, // Price in MATIC
      transactionData.terms || 'Property transfer transaction'
    );
    
    if (result.success) {
      console.log('✅ Transfer transaction created on blockchain:', result.transactionHash);
      return {
        success: true,
        transactionHash: result.transactionHash,
        blockchainTransactionId: result.transactionId,
        gasUsed: result.gasUsed
      };
    } else {
      console.error('❌ Blockchain transaction creation failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error creating blockchain transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get property details from blockchain
 * @param {string} blockchainPropertyId - Property ID on blockchain
 * @returns {Object} - Property details from blockchain
 */
async function getPropertyFromBlockchain(blockchainPropertyId) {
  try {
    const result = await blockchainService.getProperty(blockchainPropertyId);
    
    if (result.success) {
      return {
        success: true,
        property: result.property
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error getting property from blockchain:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify property ownership on blockchain
 * @param {string} blockchainPropertyId - Property ID on blockchain
 * @param {string} ownerAddress - Owner wallet address
 * @returns {Object} - Ownership verification result
 */
async function verifyOwnershipOnBlockchain(blockchainPropertyId, ownerAddress) {
  try {
    const result = await blockchainService.verifyOwnership(blockchainPropertyId, ownerAddress);
    
    if (result.success) {
      return {
        success: true,
        isOwner: result.isOwner
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error verifying ownership on blockchain:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get blockchain statistics
 * @returns {Object} - Blockchain statistics
 */
async function getBlockchainStats() {
  try {
    const result = await blockchainService.getBlockchainStats();
    
    if (result.success) {
      return {
        success: true,
        stats: result.stats
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error getting blockchain stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate document hash for blockchain storage
 * @param {string} filePath - Path to the document file
 * @returns {string} - Document hash
 */
function generateDocumentHash(filePath) {
  const crypto = require('crypto');
  const fs = require('fs');
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('❌ Error generating document hash:', error);
    return null;
  }
}

/**
 * Validate wallet address format
 * @param {string} address - Wallet address to validate
 * @returns {boolean} - True if valid Ethereum address
 */
function isValidWalletAddress(address) {
  const ethers = require('ethers');
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

module.exports = {
  registerPropertyOnBlockchain,
  approvePropertyOnBlockchain,
  createTransferTransactionOnBlockchain,
  getPropertyFromBlockchain,
  verifyOwnershipOnBlockchain,
  getBlockchainStats,
  generateDocumentHash,
  isValidWalletAddress,
  blockchainService
};
