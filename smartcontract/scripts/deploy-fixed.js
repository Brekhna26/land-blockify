const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of FIXED LandRegistry to Polygon Amoy testnet...");
  
  // Debug: Check if private key is loaded
  console.log("🔍 PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
  console.log("🔍 PRIVATE_KEY length:", process.env.PRIVATE_KEY?.length);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer?.address);
  
  if (!deployer) {
    console.error("❌ No deployer account found. Check your PRIVATE_KEY in .env file");
    process.exit(1);
  }
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.log("⚠️  Warning: Low balance. Make sure you have enough MATIC for deployment.");
  }
  
  try {
    // Deploy FIXED LandRegistry contract
    console.log("\n📋 Deploying FIXED LandRegistry contract (without nonReentrant)...");
    const LandRegistryFixed = await ethers.getContractFactory("LandRegistryFixed");
    const landRegistryFixed = await LandRegistryFixed.deploy();
    await landRegistryFixed.deployed();
    
    console.log("✅ LandRegistryFixed deployed to:", landRegistryFixed.address);
    console.log("🔗 Transaction hash:", landRegistryFixed.deployTransaction.hash);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await landRegistryFixed.deployTransaction.wait(2);
    
    // Check if deployer is already authorized (constructor already adds them)
    const isAuthorized = await landRegistryFixed.authorizedAuthorities(deployer.address);
    if (isAuthorized) {
      console.log("✅ Deployer is already authorized (added by constructor)!");
    } else {
      console.log("🔐 Adding current wallet as authorized authority...");
      const addAuthorityTx = await landRegistryFixed.addAuthority(deployer.address);
      await addAuthorityTx.wait();
      console.log("✅ Authority added successfully!");
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "amoy",
      chainId: 80002,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        LandRegistryFixed: {
          address: landRegistryFixed.address,
          transactionHash: landRegistryFixed.deployTransaction.hash
        }
      }
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, "amoy-fixed.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 FIXED deployment completed successfully!");
    console.log("📄 Deployment info saved to:", deploymentFile);
    
    // Display contract addresses for easy copying
    console.log("\n📋 Contract Addresses:");
    console.log("=".repeat(50));
    console.log("LandRegistryFixed:", landRegistryFixed.address);
    console.log("=".repeat(50));
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update your React .env.local file with the new contract address:");
    console.log(`   REACT_APP_LAND_REGISTRY_ADDRESS=${landRegistryFixed.address}`);
    console.log("2. Refresh your React app");
    console.log("3. Test property registration");
    
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
