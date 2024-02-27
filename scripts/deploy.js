// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  // const OllamaVerifier = await ethers.getContractFactory("OllamaVerifier");
  // const ollamaVerifier = await upgrades.deployProxy(OllamaVerifier, [
  //   [
  //     {
  //       "PCR0": "0xe96f8f4996a59752de33353efe59544aefef227e6ecb777ed8387fe600467d94a6aea144fde11409cd11e4c00f531e7b",
  //       "PCR1": "0xbcdf05fefccaa8e55bf2c8d6dee9e79bbff31e34bf28a99aa19e6b29c37ee80b214a414b7607236edf26fcb78654e63f",
  //       "PCR2": "0x9d6c7dd66dd2f452742ea1c3fc533ebcb75926d8d876fed7b2c0cf17db3bd0a5086b96107abf99ed0aa879fbe5805e3d"
  //     }
  //   ],
  //   owner.address
  // ], { kind: "uups", constructorArgs: ["0xDEb1326Bf357FA5BfBf0632dF7b6E338d817500D", 3600000] });
  //
  // console.log(`Ollama verifier deployed at ${ollamaVerifier.target}`);

  const OllamaMarket = await ethers.getContractFactory("OllamaMarket");
  const ollamaMarket = await upgrades.deployProxy(OllamaMarket, ["0x5fB2559A81befF3864C907A49dA8A2fD657693fC", owner.address]);
  console.log(`Ollama market deployed at ${ollamaMarket.target}`);
}

async function verify() {
  await hre.run("verify:verify", {
    address: "0x54900258f0C9Cda0FBA25C4A0607678c45E4D220",
    constructorArguments: [
      "0xDEb1326Bf357FA5BfBf0632dF7b6E338d817500D",
      3600000
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
