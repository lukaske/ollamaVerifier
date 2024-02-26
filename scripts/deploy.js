// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const OllamaVerifier = await ethers.getContractFactory("OllamaVerifier");
  const ollamaVerifier = await upgrades.deployProxy(OllamaVerifier, [
      [
          {
              "PCR0": Buffer.from("000000000000000000000000000000000000000000000002"),
              "PCR1": Buffer.from("000000000000000000000000000000000000000000000001"),
              "PCR2": Buffer.from("000000000000000000000000000000000000000000000002")
          }
      ],
      owner.address
  ], { kind: "uups", constructorArgs: ["0xDEb1326Bf357FA5BfBf0632dF7b6E338d817500D", 10000000] });

  console.log(`Ollama verifier deployed at ${ollamaVerifier.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
