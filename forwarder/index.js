const {ethers} = require("hardhat");
const axios = require("axios");

const {abi} = require("../artifacts/contracts/OllamaMarket.sol/OllamaMarket.json");

const OllamaMarketAddress = "0xca439C648dE7347A771A5d5E8993cE4089511a26";
const wssProviderUrl = "ws://localhost:8545";

async function forwarder() {
    const provider = new ethers.WebSocketProvider(wssProviderUrl);
    const [forwarder] = await ethers.getSigners();
    const market = new ethers.Contract(OllamaMarketAddress, abi, forwarder.connect(provider));
    market.addListener("RequestCreated", async (requestId, imageId, modelName, prompt, request_context) => {
        console.log(requestId, imageId, modelName, prompt, request_context);
        const resp = await axios.post("http://52.66.83.182:5000/api/generate", {
            "model": modelName,
            "prompt": prompt
        });
        await market.serveRequest(
            requestId,
            parseInt(resp.headers["x-oyster-timestamp"]),
            resp.data.response,
            JSON.stringify(resp.data.context),
            Buffer.from(resp.headers["x-oyster-signature"], "hex")
        );
        console.log("request served", requestId);
    })
}

forwarder();