require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const Contract = hre.artifacts.require("Cyclopes");
  const contract = new hre.web3.eth.Contract(
    Contract._hArtifact.abi,
    process.env.CONTRACT_ADDRESS
  );

  await contract.methods
    .setBaseURI(process.env.BASE_URI)
    .send({ from: process.env.ADDRESS });

  console.log("Base URI script has completed running.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
