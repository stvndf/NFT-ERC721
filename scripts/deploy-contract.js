require("dotenv").config();
const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const Contract = hre.artifacts.require("Cyclopes.sol");
  let contract = new hre.web3.eth.Contract(Contract._hArtifact.abi);

  await contract
    .deploy({ data: Contract._hArtifact.bytecode })
    .send({ from: process.env.ADDRESS })
    .on("error", (error) => {
      console.log("Transaction failed:");
      console.log(error);
    })
    .on("receipt", (receipt) => {
      console.log("Receipt:");
      console.log(receipt); // contains contractAddress
    })
    .then((newContractInstance) => {
      console.log("Deployment complete");
      console.log("Contract address:", newContractInstance.options.address);
    });

  console.log("Deployment script has completed running.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
