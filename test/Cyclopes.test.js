const { web3 } = require("hardhat");

const Contract = artifacts.require("Cyclopes");

// Traditional Truffle test
contract("Cyclopes", accounts => {
  const [owner, acc1] = accounts;
  let contract

  before(async () => {
    contract = await Contract.new();
  })
  it("tmp test", async () => {
    await contract.setSale(true);
    const qty = 5;
    const val = web3.utils.toWei("0.03", "ether");
    console.log('val:', val)
    const x1 = await contract.mintCyclopes(qty, {from: acc1,value: val * qty})

    const x2 = await contract.withdraw({from: owner})
    let a1 = await web3.eth.getBalance(owner)
    console.log(web3.utils.fromWei(a1))
    let a2 = await web3.eth.getBalance(acc1)
    console.log(web3.utils.fromWei(a2))

  });
});

