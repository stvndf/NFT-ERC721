const { artifacts } = require("hardhat");

async function main() {

  const Cyclopes = artifacts.require("Cyclopes");
  console.log("Deploying Cyclopes...");
  // const cyclopes = await Cyclopes.deploy();
  await cyclopes.deployed();
  console.log("Cyclopes deployed to:", cyclopes.address);



  // const Cyclopes = await ethers.getContractFactory("Box");
  // console.log("Deploying Box...");
  // const box = await Box.deploy();
  // await box.deployed();
  // console.log("Box deployed to:", box.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });