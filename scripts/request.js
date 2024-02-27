const {ethers} = require("hardhat");
const axios = require("axios");

const OllamaMarketAddress = "0xca439C648dE7347A771A5d5E8993cE4089511a26";

async function sendRequest() {
    const market = await ethers.getContractAt("OllamaMarket", OllamaMarketAddress);

    await market.createRequest(ethers.keccak256(Buffer.from("123")), "llama2", "What is Ethereum", "[]")
}

sendRequest();