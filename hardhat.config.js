require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:1248",
      timeout: 100_000,
    },
    polygon: {
      url: "https://polygon.llamarpc.com"
    }
  },
  etherscan: {
    apiKey: {
      polygon: "DYZ7P4KN2JBGIB3Z6QGR93HKHXXF1EEDHH"
    }
  },
  solidity: "0.8.24",
};
