const {ethers} = require("hardhat");
const axios = require("axios");

const OllamaVerifierAddress = "";

async function verifyInference(prompt, model, OllamaVerifierAddress) {
    const ollamaVerifier = await ethers.getContractAt("OllamaVerifier", OllamaVerifierAddress);

     const resp = await axios.post("http://13.126.159.176:5000/api/generate", {
        "model": model,
        "prompt": prompt
    });
    
    // extract the signature from response headers
    const signature = Buffer.from(resp.headers["x-oyster-signature"], "hex");

    // response can be verified using the signature which is extracted from the response headers
    await ollamaVerifier.verifyResult(
        parseInt(resp.headers["x-oyster-timestamp"]), // time at which inference was done
        model, // name of the model
        prompt, // prompt used for inference
        JSON.stringify([]), // input context for inference
        resp.data.response, // response of the inference
        JSON.stringify(resp.data.context), // output context for inference
        signature // signature by the enclave key to verify that the inference was done correctly within an enclave
    );   
}

verifyInference("What is Ethereum", "tinyllama", OllamaVerifierAddress)