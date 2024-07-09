const {ethers} = require("hardhat");
const axios = require("axios");

const OllamaVerifierAddress = "0x205EAcEa1F138EFE9f707d2C6C1296b6ceBEd085";

async function verifyInference(prompt, model, OllamaVerifierAddress) {
    const ollamaVerifier = await ethers.getContractAt("OllamaVerifier", OllamaVerifierAddress);
    //await ollamaVerifier.whitelistEnclaveKey(
    //    Buffer.from('1d59d4288758560002111aede394202927cd67c54d43e2ffb41ae1fb62a2444779eeb767120b1fd59295c64c0c745dc8da6bae5acf53b6dc5a069c2b36a636da', 'hex'),
    //    Buffer.from('88004b14c6a685217b1b269d977c98cd9ba5fc12a09249e80a605b3d382a43bd', 'hex'),
    //)

     const resp = await axios.post("http://13.202.156.182:5000/api/generate", {
        "model": model,
        "prompt": prompt
    });
    
    // extract the signature from response headers
    const signature = Buffer.from(resp.headers["x-oyster-signature"], "hex");

    // response can be verified using the signature which is extracted from the response headers
    let res = await ollamaVerifier.verifyResult(
        parseInt(resp.headers["x-oyster-timestamp"]), // time at which inference was done
        model, // name of the model
        prompt, // prompt used for inference
        JSON.stringify([]), // input context for inference
        resp.data.response, // response of the inference
        JSON.stringify(resp.data.context), // output context for inference
        signature // signature by the enclave key to verify that the inference was done correctly within an enclave
    );   
    console.log(res);
}

verifyInference("What is Ethereum in 5 words", "llama2", OllamaVerifierAddress)