import { ethers } from "ethers";

// Contract ABIs - Main functions for LandBlockify
const LAND_REGISTRY_ABI = [
  "function registerProperty(string propertyIdentifier, string ownerName, string location, uint256 landArea, string propertyType, string legalDescription, string documentHash) external returns (uint256)",
  "function getProperty(uint256 propertyId) external view returns (tuple(uint256 propertyId, string propertyIdentifier, address govt, string ownerName, string location, uint256 landArea, string propertyType, string legalDescription, string documentHash, uint256 registrationTimestamp, bool isActive, bool isApproved, address approvedBy))",
  "function getPropertyIdByIdentifier(string propertyIdentifier) external view returns (uint256)",
  "function getTotalProperties() external view returns (uint256)",
  "function addAuthority(address authority) external",
  "function authorizedAuthorities(address) external view returns (bool)",
  "event PropertyRegistered(uint256 indexed propertyId, string propertyIdentifier, address indexed owner, string location, uint256 landArea)",
];

const PROPERTY_TRANSFER_ABI = [
  "function createTransaction(uint256 propertyId, address buyer, string buyerName, uint256 price, string terms) external returns (uint256)",
  "function acceptTransaction(uint256 transactionId) external payable",
  "function completeTransaction(uint256 transactionId) external",
  "function cancelTransaction(uint256 transactionId) external",
  "event TransactionCreated(uint256 indexed transactionId, uint256 indexed propertyId, address indexed seller, address buyer, uint256 price)",
];

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  LAND_REGISTRY:
    process.env.REACT_APP_LAND_REGISTRY_ADDRESS ||
    "0x7b2Bde3D41130D56D2BDe89b8c0B23c220AD9544",
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

      if (CONTRACT_ADDRESSES.LAND_REGISTRY && LAND_REGISTRY_ABI.length > 0) {
        this.contracts.landRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.LAND_REGISTRY,
          LAND_REGISTRY_ABI,
          this.signer
        );
        console.log("✅ LandRegistry contract initialized");
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
      return accounts.length > 0 ? accounts[0].address : null;
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
      if (!this.account || !this.signer) {
        throw new Error("Wallet not connected");
      }

      if (!this.contracts.landRegistry) {
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
      const receipt = await tx.wait();

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

  // Property Transfer Functions
  async createTransaction(propertyId, buyer, buyerName, price, terms) {
    try {
      if (!this.contracts.propertyTransfer) {
        throw new Error("PropertyTransfer contract not initialized");
      }

      const priceInWei = ethers.parseEther(price.toString());
      const tx = await this.contracts.propertyTransfer.createTransaction(
        propertyId,
        buyer,
        buyerName,
        priceInWei,
        terms
      );

      console.log("💰 Transaction creation sent:", tx.hash);
      const receipt = await tx.wait();

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

  // Utility Functions
  getLandRegistryAddress() {
    return CONTRACT_ADDRESSES.LAND_REGISTRY;
  }

  getPropertyTransferAddress() {
    return CONTRACT_ADDRESSES.PROPERTY_TRANSFER;
  }

  // Disconnect wallet
  disconnect() {
    this.account = null;
    this.signer = null;
    this.contracts = {};
    console.log("🔓 Wallet disconnected");
  }

  // Authority Management Functions
  async addAuthority(authorityAddress) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const tx = await this.contracts.landRegistry.addAuthority(authorityAddress);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error adding authority:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkAuthority(address) {
    try {
      if (!this.contracts.landRegistry) {
        throw new Error("LandRegistry contract not initialized");
      }

      const isAuthorized = await this.contracts.landRegistry.authorizedAuthorities(address);
      return {
        success: true,
        isAuthorized: isAuthorized,
      };
    } catch (error) {
      console.error("❌ Error checking authority:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async addSelfAsAuthority() {
    try {
      if (!this.account) {
        throw new Error("Wallet not connected");
      }

      const result = await this.addAuthority(this.account);
      return result;
    } catch (error) {
      console.error("❌ Error adding self as authority:", error);
      return {
        success: false,
        error: error.message,
      };
    }
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
export const createTransaction = (propertyId, buyer, buyerName, price, terms) =>
  web3Service.createTransaction(propertyId, buyer, buyerName, price, terms);
