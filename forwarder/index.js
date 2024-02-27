const { ethers } = require("ethers");
const axios = require("axios");

const { abi } = require("../artifacts/contracts/OllamaMarket.sol/OllamaMarket.json");

const OllamaMarketAddress = "0x5343579EB412f0F6CFb57c4E4f8567c3c5896076";
const wssProviderUrl = "wss://polygon-mainnet.g.alchemy.com/v2/KpvbfBf_ghrsFRo-t3VJfW7YF-xTl4yQ";

async function forwarder() {
    const provider = new ethers.WebSocketProvider(wssProviderUrl);
    const forwarder = new ethers.Wallet("60dde87f762cf791c5e79054972c557310757b114823e6561409903449fbfc24")
    const market = new ethers.Contract(OllamaMarketAddress, abi, forwarder.connect(provider));
    market.addListener("RequestCreated", async (requestId, modelName, prompt, request_context) => {
        console.log(requestId, modelName, prompt, request_context);
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
