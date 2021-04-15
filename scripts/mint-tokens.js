require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const Contract = hre.artifacts.require("Cyclopes");
  const contract = new hre.web3.eth.Contract(
    Contract._hArtifact.abi,
    process.env.CONTRACT_ADDRESS
  );

  await contract.methods.setSale(true).send({ from: process.env.ADDRESS }); // sale must be open to mint

  let price;
  price = await contract.methods
    .getCurrentPrice()
    .call({ from: process.env.ADDRESS });

  await contract.methods.mintCyclopes(5).send({
    from: process.env.ADDRESS,
    value: price * 5,
  });
  price = await contract.methods
    .getCurrentPrice()
    .call({ from: process.env.ADDRESS });
  await contract.methods.mintCyclopes(5).send({
    from: process.env.ADDRESS,
    value: price * 5,
  });
  price = await contract.methods
    .getCurrentPrice()
    .call({ from: process.env.ADDRESS });
  await contract.methods.mintCyclopes(4).send({
    from: process.env.ADDRESS,
    value: price * 4,
  });

  console.log("Minting script has completed running.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
