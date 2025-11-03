const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load contract ABIs
const loadContractABI = (contractName) => {
  try {
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return artifact.abi;
  } catch (error) {
    console.error(`Error loading ABI for ${contractName}:`, error);
    return null;
  }
};

// Load deployment addresses
const loadDeploymentAddresses = (network = "mumbai") => {
  try {
    const deploymentPath = path.join(__dirname, "..", "deployments", `${network}.json`);
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    return deployment.contracts;
  } catch (error) {
    console.error(`Error loading deployment addresses for ${network}:`, error);
    return null;
  }
};

class BlockchainService {
  constructor(providerUrl, privateKey = null) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.wallet = privateKey ? new ethers.Wallet(privateKey, this.provider) : null;
    this.contracts = {};
    this.contractAddresses = loadDeploymentAddresses();
    
    // Initialize contracts
    this.initializeContracts();
  }
  
  initializeContracts() {
    if (!this.contractAddresses) {
      console.warn("No deployment addresses found. Please deploy contracts first.");
      return;
    }
    
    try {
      // Load ABIs
      const landRegistryABI = loadContractABI("LandRegistry");
      const propertyTransferABI = loadContractABI("PropertyTransfer");
      
      if (landRegistryABI && this.contractAddresses.LandRegistry) {
        this.contracts.landRegistry = new ethers.Contract(
          this.contractAddresses.LandRegistry.address,
          landRegistryABI,
          this.wallet || this.provider
        );
      }
      
      if (propertyTransferABI && this.contractAddresses.PropertyTransfer) {
        this.contracts.propertyTransfer = new ethers.Contract(
          this.contractAddresses.PropertyTransfer.address,
          propertyTransferABI,
          this.wallet || this.provider
        );
      }
      
      console.log("✅ Blockchain contracts initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing contracts:", error);
    }
  }
  
  // Land Registry Functions
  async registerProperty(propertyData) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }
      
      const tx = await this.contracts.landRegistry.registerProperty(
        propertyData.propertyIdentifier,
        propertyData.owner,
        propertyData.location,
        propertyData.landArea,
        propertyData.propertyType,
        propertyData.legalDescription,
        propertyData.documentHash
      );
      
      console.log("🏠 Property registration transaction sent:", tx.hash);
      const receipt = await tx.wait();
      
      // Extract property ID from events
      const event = receipt.events.find(e => e.event === "PropertyRegistered");
      const propertyId = event ? event.args.propertyId.toString() : null;
      
      return {
        success: true,
        transactionHash: tx.hash,
        propertyId: propertyId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error("❌ Error registering property:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async approveProperty(propertyId) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }
      
      const tx = await this.contracts.landRegistry.approveProperty(propertyId);
      console.log("✅ Property approval transaction sent:", tx.hash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error("❌ Error approving property:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getProperty(propertyId) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }
      
      const property = await this.contracts.landRegistry.getProperty(propertyId);
      return {
        success: true,
        property: {
          propertyId: property.propertyId.toString(),
          propertyIdentifier: property.propertyIdentifier,
          owner: property.owner,
          location: property.location,
          landArea: property.landArea.toString(),
          propertyType: property.propertyType,
          legalDescription: property.legalDescription,
          documentHash: property.documentHash,
          registrationTimestamp: property.registrationTimestamp.toString(),
          isActive: property.isActive,
          isApproved: property.isApproved,
          approvedBy: property.approvedBy
        }
      };
    } catch (error) {
      console.error("❌ Error getting property:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async verifyOwnership(propertyId, ownerAddress) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }
      
      const isOwner = await this.contracts.landRegistry.verifyOwnership(propertyId, ownerAddress);
      return {
        success: true,
        isOwner: isOwner
      };
    } catch (error) {
      console.error("❌ Error verifying ownership:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Property Transfer Functions
  async createTransaction(propertyId, buyer, price, terms) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }
      
      const priceInWei = ethers.utils.parseEther(price.toString());
      const tx = await this.contracts.propertyTransfer.createTransaction(
        propertyId,
        buyer,
        priceInWei,
        terms
      );
      
      console.log("💰 Transaction creation sent:", tx.hash);
      const receipt = await tx.wait();
      
      // Extract transaction ID from events
      const event = receipt.events.find(e => e.event === "TransactionCreated");
      const transactionId = event ? event.args.transactionId.toString() : null;
      
      return {
        success: true,
        transactionHash: tx.hash,
        transactionId: transactionId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error("❌ Error creating transaction:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async acceptTransaction(transactionId, price) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }
      
      const priceInWei = ethers.utils.parseEther(price.toString());
      const tx = await this.contracts.propertyTransfer.acceptTransaction(transactionId, {
        value: priceInWei
      });
      
      console.log("✅ Transaction acceptance sent:", tx.hash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error("❌ Error accepting transaction:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async completeTransaction(transactionId) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }
      
      const tx = await this.contracts.propertyTransfer.completeTransaction(transactionId);
      console.log("🎉 Transaction completion sent:", tx.hash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error("❌ Error completing transaction:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getTransaction(transactionId) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }
      
      const transaction = await this.contracts.propertyTransfer.getTransaction(transactionId);
      return {
        success: true,
        transaction: {
          transactionId: transaction.transactionId.toString(),
          propertyId: transaction.propertyId.toString(),
          seller: transaction.seller,
          buyer: transaction.buyer,
          price: ethers.utils.formatEther(transaction.price),
          createdTimestamp: transaction.createdTimestamp.toString(),
          completedTimestamp: transaction.completedTimestamp.toString(),
          status: transaction.status,
          terms: transaction.terms,
          escrowReleased: transaction.escrowReleased
        }
      };
    } catch (error) {
      console.error("❌ Error getting transaction:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Utility Functions
  async getBlockchainStats() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      let totalProperties = 0;
      let totalTransactions = 0;
      
      if (this.contracts.landRegistry) {
        totalProperties = await this.contracts.landRegistry.getTotalProperties();
        totalProperties = totalProperties.toString();
      }
      
      if (this.contracts.propertyTransfer) {
        totalTransactions = await this.contracts.propertyTransfer.getTotalTransactions();
        totalTransactions = totalTransactions.toString();
      }
      
      return {
        success: true,
        stats: {
          network: network.name,
          chainId: network.chainId,
          blockNumber: blockNumber,
          totalProperties: totalProperties,
          totalTransactions: totalTransactions,
          contractAddresses: this.contractAddresses
        }
      };
    } catch (error) {
      console.error("❌ Error getting blockchain stats:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  BlockchainService,
  loadContractABI,
  loadDeploymentAddresses
};
