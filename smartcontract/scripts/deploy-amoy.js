const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "POL");
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. Make sure you have enough POL for deployment.");
  }
  
  try {
    // Deploy LandRegistry contract
    console.log("\n📋 Deploying LandRegistry contract...");
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
    
    const landRegistryAddress = await landRegistry.getAddress();
    console.log("✅ LandRegistry deployed to:", landRegistryAddress);
    console.log("🔗 Transaction hash:", landRegistry.deploymentTransaction().hash);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await landRegistry.deploymentTransaction().wait(2);
    
    // Deploy PropertyTransfer contract
    console.log("\n🏠 Deploying PropertyTransfer contract...");
    const PropertyTransfer = await ethers.getContractFactory("PropertyTransfer");
    const propertyTransfer = await PropertyTransfer.deploy(landRegistryAddress);
    await propertyTransfer.waitForDeployment();
    
    const propertyTransferAddress = await propertyTransfer.getAddress();
    console.log("✅ PropertyTransfer deployed to:", propertyTransferAddress);
    console.log("🔗 Transaction hash:", propertyTransfer.deploymentTransaction().hash);
    
    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    await propertyTransfer.deploymentTransaction().wait(2);
    
    // Save deployment info
    const deploymentInfo = {
      network: "amoy",
      chainId: 80002,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        LandRegistry: {
          address: landRegistryAddress,
          transactionHash: landRegistry.deploymentTransaction().hash
        },
        PropertyTransfer: {
          address: propertyTransferAddress,
          transactionHash: propertyTransfer.deploymentTransaction().hash
        }
      }
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, "amoy.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Also update the main deployed-contracts.json file
    const mainContractsFile = path.join(__dirname, "..", "deployed-contracts.json");
    const contractsInfo = {
      network: "amoy",
      chainId: 80002,
      LandRegistry: landRegistryAddress,
      PropertyTransfer: propertyTransferAddress
    };
    fs.writeFileSync(mainContractsFile, JSON.stringify(contractsInfo, null, 2));
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📄 Deployment info saved to:", deploymentFile);
    console.log("📄 Contract addresses updated in:", mainContractsFile);
    
    // Display contract addresses for easy copying
    console.log("\n📋 Contract Addresses:");
    console.log("=".repeat(50));
    console.log("LandRegistry:", landRegistryAddress);
    console.log("PropertyTransfer:", propertyTransferAddress);
    console.log("=".repeat(50));
    
    // Display verification commands
    console.log("\n🔍 To verify contracts on OKLink (Amoy Explorer), run:");
    console.log(`npx hardhat verify --network amoy ${landRegistryAddress}`);
    console.log(`npx hardhat verify --network amoy ${propertyTransferAddress} "${landRegistryAddress}"`);
    
    // Display next steps
    console.log("\n📝 Next Steps:");
    console.log("1. Contract addresses have been automatically updated in deployed-contracts.json");
    console.log("2. Update your .env file with the new contract addresses if needed");
    console.log("3. The frontend web3.js will automatically use the new addresses");
    console.log("4. Test the blockchain integration in your React app");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });
