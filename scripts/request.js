const { ethers } = require("hardhat");
const axios = require("axios");

const OllamaMarketAddress = "0x5343579EB412f0F6CFb57c4E4f8567c3c5896076";

async function sendRequest() {
    const market = await ethers.getContractAt("OllamaMarket", OllamaMarketAddress);

    await market.createRequest("llama2", "What is Ethereum", "[]")
}

sendRequest();
