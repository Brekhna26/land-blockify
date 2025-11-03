import { ethers } from "ethers";

// Contract ABIs - Main functions for LandBlockify
const LAND_REGISTRY_ABI = [
  "function registerProperty(string propertyIdentifier, string ownerName, string location, uint256 landArea, string propertyType, string legalDescription, string documentHash) external returns (uint256)",
  "function approveProperty(uint256 propertyId) external",
  "function transferProperty(uint256 propertyId, string newOwnerName) external",
  "function getProperty(uint256 propertyId) external view returns (tuple(uint256 propertyId, string propertyIdentifier, address govt, string ownerName, string location, uint256 landArea, string propertyType, string legalDescription, string documentHash, uint256 registrationTimestamp, bool isActive, bool isApproved, address approvedBy))",
  "function verifyOwnershipByName(uint256 propertyId, string ownerName) external view returns (bool)",
  "function verifyGovtRegistration(uint256 propertyId, address govt) external view returns (bool)",
  "function getTotalProperties() external view returns (uint256)",
  "function getPropertiesByOwnerName(string ownerName) external view returns (uint256[])",
  "function getPropertiesByGovt(address govt) external view returns (uint256[])",
  "function addAuthority(address authority) external",
  "function removeAuthority(address authority) external",
  "event PropertyRegistered(uint256 indexed propertyId, string propertyIdentifier, address indexed owner, string location, uint256 landArea)",
  "event PropertyApproved(uint256 indexed propertyId, address indexed approvedBy, uint256 timestamp)",
  "event PropertyTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 timestamp)",
];

const PROPERTY_TRANSFER_ABI = [
  "function createTransaction(uint256 propertyId, address buyer, uint256 price, string terms) external returns (uint256)",
  "function acceptTransaction(uint256 transactionId) external payable",
  "function completeTransaction(uint256 transactionId) external",
  "function cancelTransaction(uint256 transactionId) external",
  "function raiseDispute(uint256 transactionId) external",
  "function resolveDispute(uint256 transactionId, bool refundBuyer) external",
  "function getTransaction(uint256 transactionId) external view returns (tuple(uint256 transactionId, uint256 propertyId, address seller, address buyer, uint256 price, uint256 createdTimestamp, uint256 completedTimestamp, uint8 status, string terms, bool escrowReleased))",
  "function getUserTransactions(address user) external view returns (uint256[])",
  "function getPropertyActiveTransaction(uint256 propertyId) external view returns (uint256)",
  "function getTotalTransactions() external view returns (uint256)",
  "event TransactionCreated(uint256 indexed transactionId, uint256 indexed propertyId, address indexed seller, address buyer, uint256 price)",
  "event TransactionAccepted(uint256 indexed transactionId, address indexed buyer, uint256 timestamp)",
  "event TransactionCompleted(uint256 indexed transactionId, uint256 indexed propertyId, address indexed seller, address buyer, uint256 price, uint256 timestamp)",
  "event EscrowDeposited(uint256 indexed transactionId, address indexed buyer, uint256 amount)",
  "event EscrowReleased(uint256 indexed transactionId, address indexed seller, uint256 amount)",
];

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  LAND_REGISTRY:
    process.env.REACT_APP_LAND_REGISTRY_ADDRESS ||
    "0x7f9dda378bbebb99038be1bd7830663d5d90ba47",
  PROPERTY_TRANSFER:
    process.env.REACT_APP_PROPERTY_TRANSFER_ADDRESS ||
    "0x76ff87120de0ddcdb09fac0052de6ee6da383012",
};

// Polygon Amoy testnet configuration
const AMOY_CONFIG = {
  chainId: "0x13882", // 80002 in hex
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: [
    "https://polygon-amoy-bor-rpc.publicnode.com"
  ],
  blockExplorerUrls: ["https://www.oklink.com/amoy"],
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.account = null;
  }

  // Initialize Web3 connection
  async init() {
    try {
      if (typeof window.ethereum !== "undefined") {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        console.log("✅ MetaMask detected");
        return true;
      } else {
        console.error("❌ MetaMask not detected");
        return false;
      }
    } catch (error) {
      console.error("❌ Error initializing Web3:", error);
      return false;
    }
  }

  // Connect to MetaMask wallet
  async connectWallet() {
    try {
      if (!this.provider) {
        throw new Error("Web3 not initialized");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.account = accounts[0];
      this.signer = await this.provider.getSigner();

      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 80002) {
        await this.switchToAmoy();
      }

      // Initialize contracts
      await this.initializeContracts();

      console.log("✅ Wallet connected:", this.account);
      return {
        success: true,
        account: this.account,
      };
    } catch (error) {
      console.error("❌ Error connecting wallet:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Switch to Polygon Amoy testnet
  async switchToAmoy() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CONFIG.chainId }],
      });
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [AMOY_CONFIG],
          });
        } catch (addError) {
          throw new Error("Failed to add Amoy network");
        }
      } else {
        throw switchError;
      }
    }
  }

  // Initialize smart contracts
  async initializeContracts() {
    try {
      if (!this.signer) {
        throw new Error("Signer not available");
      }

      console.log("🔍 Contract initialization debug:");
      console.log("- LandRegistry Address:", CONTRACT_ADDRESSES.LAND_REGISTRY);
      console.log(
        "- PropertyTransfer Address:",
        CONTRACT_ADDRESSES.PROPERTY_TRANSFER
      );
      console.log("- LandRegistry ABI length:", LAND_REGISTRY_ABI.length);
      console.log(
        "- PropertyTransfer ABI length:",
        PROPERTY_TRANSFER_ABI.length
      );

      if (CONTRACT_ADDRESSES.LAND_REGISTRY && LAND_REGISTRY_ABI.length > 0) {
        this.contracts.landRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.LAND_REGISTRY,
          LAND_REGISTRY_ABI,
          this.signer
        );
        console.log("✅ LandRegistry contract initialized");
      } else {
        console.error(
          "❌ LandRegistry contract initialization failed - missing address or ABI"
        );
      }

      if (
        CONTRACT_ADDRESSES.PROPERTY_TRANSFER &&
        PROPERTY_TRANSFER_ABI.length > 0
      ) {
        this.contracts.propertyTransfer = new ethers.Contract(
          CONTRACT_ADDRESSES.PROPERTY_TRANSFER,
          PROPERTY_TRANSFER_ABI,
          this.signer
        );
        console.log("✅ PropertyTransfer contract initialized");
      } else {
        console.error(
          "❌ PropertyTransfer contract initialization failed - missing address or ABI"
        );
      }

      console.log("✅ Smart contracts initialized");
    } catch (error) {
      console.error("❌ Error initializing contracts:", error);
    }
  }

  // Get current account
  async getCurrentAccount() {
    try {
      if (!this.provider) return null;

      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("❌ Error getting current account:", error);
      return null;
    }
  }

  // Get account balance
  async getBalance(address = null) {
    try {
      if (!this.provider) return "0";

      const account = address || this.account;
      if (!account) return "0";

      const balance = await this.provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("❌ Error getting balance:", error);
      return "0";
    }
  }

  // Land Registry Functions
  async registerProperty(propertyData) {
    try {
      // Ensure wallet is connected and contracts are initialized
      if (!this.account) {
        throw new Error("Wallet not connected");
      }

      if (!this.signer) {
        throw new Error("Signer not available");
      }

      // Re-initialize contracts if not available
      if (!this.contracts.landRegistry) {
        console.log("🔄 Re-initializing contracts...");
        await this.initializeContracts();
      }

      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const tx = await this.contracts.landRegistry.registerProperty(
        propertyData.propertyIdentifier,
        propertyData.ownerName,
        propertyData.location,
        propertyData.landArea,
        propertyData.propertyType,
        propertyData.legalDescription,
        propertyData.documentHash
      );

      console.log("🏠 Property registration transaction sent:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Extract property ID from events
      const event = receipt.events?.find(
        (e) => e.event === "PropertyRegistered"
      );
      const propertyId = event ? event.args.propertyId.toString() : null;

      return {
        success: true,
        transactionHash: tx.hash,
        propertyId: propertyId,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error registering property:", error);
      return {
        success: false,
        error: error.message,
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
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error approving property:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProperty(propertyId) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const property = await this.contracts.landRegistry.getProperty(
        propertyId
      );

      return {
        success: true,
        property: {
          propertyId: property.propertyId.toString(),
          propertyIdentifier: property.propertyIdentifier,
          govt: property.govt,
          ownerName: property.ownerName,
          location: property.location,
          landArea: property.landArea.toString(),
          propertyType: property.propertyType,
          legalDescription: property.legalDescription,
          documentHash: property.documentHash,
          registrationTimestamp: property.registrationTimestamp.toString(),
          isActive: property.isActive,
          isApproved: property.isApproved,
          approvedBy: property.approvedBy,
        },
      };
    } catch (error) {
      console.error("❌ Error getting property:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyOwnershipByName(propertyId, ownerName) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const isOwner = await this.contracts.landRegistry.verifyOwnershipByName(
        propertyId,
        ownerName
      );

      return {
        success: true,
        isOwner: isOwner,
      };
    } catch (error) {
      console.error("❌ Error verifying ownership by name:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyGovtRegistration(propertyId, govtAddress) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const isGovt = await this.contracts.landRegistry.verifyGovtRegistration(
        propertyId,
        govtAddress
      );

      return {
        success: true,
        isGovt: isGovt,
      };
    } catch (error) {
      console.error("❌ Error verifying government registration:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Property Transfer Functions
  async createTransaction(propertyId, buyer, price, terms) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }

      const priceInWei = ethers.parseEther(price.toString());
      const tx = await this.contracts.propertyTransfer.createTransaction(
        propertyId,
        buyer,
        priceInWei,
        terms
      );

      console.log("💰 Transaction creation sent:", tx.hash);
      const receipt = await tx.wait();

      // Extract transaction ID from events
      const event = receipt.events?.find(
        (e) => e.event === "TransactionCreated"
      );
      const transactionId = event ? event.args.transactionId.toString() : null;

      return {
        success: true,
        transactionHash: tx.hash,
        transactionId: transactionId,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error creating transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async acceptTransaction(transactionId, price) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }

      const priceInWei = ethers.parseEther(price.toString());
      const tx = await this.contracts.propertyTransfer.acceptTransaction(
        transactionId,
        {
          value: priceInWei,
        }
      );

      console.log("✅ Transaction acceptance sent:", tx.hash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error accepting transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async completeTransaction(transactionId) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }

      const tx = await this.contracts.propertyTransfer.completeTransaction(
        transactionId
      );
      console.log("🎉 Transaction completion sent:", tx.hash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error completing transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Utility Functions
  async getTransactionStatus(txHash) {
    try {
      if (!this.provider) return null;

      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      console.error("❌ Error getting transaction status:", error);
      return null;
    }
  }

  // Event listeners
  setupEventListeners() {
    if (window.ethereum) {
      // Account changed
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          this.account = null;
          this.signer = null;
          console.log("🔓 Wallet disconnected");
        } else {
          this.account = accounts[0];
          console.log("🔄 Account changed to:", this.account);
        }
      });

      // Chain changed
      window.ethereum.on("chainChanged", (chainId) => {
        console.log("🔄 Chain changed to:", chainId);
        window.location.reload(); // Reload the page to reset the app state
      });
    }
  }

  // Disconnect wallet
  disconnect() {
    this.account = null;
    this.signer = null;
    this.contracts = {};
    console.log("🔓 Wallet disconnected");
  }

  // Get contract addresses
  getLandRegistryAddress() {
    return CONTRACT_ADDRESSES.LAND_REGISTRY;
  }

  getPropertyTransferAddress() {
    return CONTRACT_ADDRESSES.PROPERTY_TRANSFER;
  }
}

// Create singleton instance
const web3Service = new Web3Service();

// Export both default and named export for compatibility
export default web3Service;
export { web3Service };

// Export convenience functions
export const connectWallet = () => web3Service.connectWallet();
export const registerProperty = (propertyData) =>
  web3Service.registerProperty(propertyData);
export const getWeb3Service = () => web3Service;
