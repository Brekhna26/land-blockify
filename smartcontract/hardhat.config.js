require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY && (process.env.PRIVATE_KEY.length === 64 || process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: 30000000000, // 30 gwei
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY && (process.env.PRIVATE_KEY.length === 64 || process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 30000000000, // 30 gwei
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY && (process.env.PRIVATE_KEY.length === 64 || process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 30000000000,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
