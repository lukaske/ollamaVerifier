const { ethers, upgrades } = require('hardhat');
const axios = require("axios");

describe("Ollama Verifier", function () {
    async function deployOllamaVerifierFixture() {
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

        return ollamaVerifier;
    }

    it("test sig", async function() {
        this.timeout(40000000);
        const ollamaVerifier = await deployOllamaVerifierFixture();

        const prompt = "What is ethereum";
        const model = "llama2";

        const resp = await axios.post("http://52.66.83.182:5000/api/generate", {
            "model": model,
            "prompt": prompt
        });
        console.log(resp.data)

        await ollamaVerifier.verifyResult(
            ethers.ZeroHash,
            parseInt(resp.headers["x-oyster-timestamp"]),
            model,
            prompt,
            JSON.stringify([]),
            resp.data.response,
            JSON.stringify(resp.data.context),
            Buffer.from(resp.headers["x-oyster-signature"], "hex")
        );
    });
})