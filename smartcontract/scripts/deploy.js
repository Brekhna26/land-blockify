const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Polygon Mumbai testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.log("⚠️  Warning: Low balance. Make sure you have enough MATIC for deployment.");
  }
  
  try {
    // Deploy LandRegistry contract
    console.log("\n📋 Deploying LandRegistry contract...");
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();
    await landRegistry.deployed();
    
    console.log("✅ LandRegistry deployed to:", landRegistry.address);
    console.log("🔗 Transaction hash:", landRegistry.deployTransaction.hash);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await landRegistry.deployTransaction.wait(2);
    
    // Deploy PropertyTransfer contract
    console.log("\n🏠 Deploying PropertyTransfer contract...");
    const PropertyTransfer = await ethers.getContractFactory("PropertyTransfer");
    const propertyTransfer = await PropertyTransfer.deploy(landRegistry.address);
    await propertyTransfer.deployed();
    
    console.log("✅ PropertyTransfer deployed to:", propertyTransfer.address);
    console.log("🔗 Transaction hash:", propertyTransfer.deployTransaction.hash);
    
    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    await propertyTransfer.deployTransaction.wait(2);
    
    // Save deployment info
    const deploymentInfo = {
      network: "mumbai",
      chainId: 80001,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        LandRegistry: {
          address: landRegistry.address,
          transactionHash: landRegistry.deployTransaction.hash
        },
        PropertyTransfer: {
          address: propertyTransfer.address,
          transactionHash: propertyTransfer.deployTransaction.hash
        }
      }
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, "mumbai.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📄 Deployment info saved to:", deploymentFile);
    
    // Display contract addresses for easy copying
    console.log("\n📋 Contract Addresses:");
    console.log("=".repeat(50));
    console.log("LandRegistry:", landRegistry.address);
    console.log("PropertyTransfer:", propertyTransfer.address);
    console.log("=".repeat(50));
    
    // Display verification commands
    console.log("\n🔍 To verify contracts on PolygonScan, run:");
    console.log(`npx hardhat verify --network mumbai ${landRegistry.address}`);
    console.log(`npx hardhat verify --network mumbai ${propertyTransfer.address} "${landRegistry.address}"`);
    
    // Display next steps
    console.log("\n📝 Next Steps:");
    console.log("1. Update your .env file with the contract addresses");
    console.log("2. Update your backend configuration with the new addresses");
    console.log("3. Test the contracts using the provided test scripts");
    console.log("4. Integrate with your React frontend");
    
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
