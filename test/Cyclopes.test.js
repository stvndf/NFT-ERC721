const { web3 } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

const Contract = artifacts.require("Cyclopes");

contract("Cyclopes", (accounts) => {
  const [owner, acc1] = accounts;
  let contract;

  // For tests involving minting:
  const tier1Price = web3.utils.toWei("0.03", "ether");
  const tier2Price = web3.utils.toWei("0.05", "ether");
  const tier3Price = web3.utils.toWei("0.1", "ether");
  const tier4Price = web3.utils.toWei("0.3", "ether");
  const tier5Price = web3.utils.toWei("0.5", "ether");
  const tier6Price = web3.utils.toWei("0.7", "ether");
  const tier7Price = web3.utils.toWei("1", "ether");
  const tier1Roof = 74;
  const tier2Roof = 187;
  const tier3Roof = 902;
  const tier4Roof = 2693;
  const tier5Roof = 4484;
  const tier6Roof = 5199;
  const tier7Roof = 5255; // maxSupply
  const mintTier1Limit = 5;
  const mintTier2Limit = 10;
  const mintTier1Roof = 902;
  const mintTier2Roof = 5255 // maxSupply
  let currentSupply; // is reset to 0 after each test
  async function mintAllTokensForTier(tierRoof, tierPrice, mintTierLimit) {
    while (currentSupply < tierRoof) {
      /*
        Determining mint quantity (to not exceed tier mint quantity limit). Example:
          (8 tierRoof) - (5 currentSupply) = (3 to mint)
          If default mintQty is higher than 3, it'll be lowered to 3
      */
      let mintQty;
      if ((tierRoof - currentSupply) < mintTierLimit) {
        mintQty = tierRoof - currentSupply;
      } else {
        mintQty = mintTierLimit;
      }
      if (mintQty < mintTierLimit) {
        await contract.mintCyclopes(mintQty, {value: tierPrice * mintQty});
      } else {
        await contract.mintCyclopes(mintQty, {value: tierPrice * mintQty});
      }
      currentSupply += mintQty;
    }
  }

  beforeEach(async () => {
    contract = await Contract.new();
    currentSupply = 0; // for tests involving minting
  });

  describe("Values at deployment", () => {
    it("R (truth)", async () => {
      assert.equal(
        await contract.R(),
        "If it's not right, don't do it; if it's not true, don't say it. - Marcus Aurelius"
      );
    });
    it("Token name", async () => {
      assert.equal(await contract.name(), "Cyclopes from the Ether");
    });
    it("Token symbol", async () => {
      assert.equal(await contract.symbol(), "CYCP");
    });
    it("isSaleStarted starts as false", async () => {
      assert.equal(await contract.isSaleStarted(), false);
    });
  });

  describe("setSale function", () => {
    it("onlyOwner", async () => {
      await contract.setSale(true, { from: owner });
      await expectRevert(
        contract.setSale(false, { from: acc1 }),
        "Ownable: caller is not the owner"
      );
    });
    it("Sets value correctly", async () => {
      await contract.setSale(true, { from: owner });
      assert.equal(await contract.isSaleStarted(), true);
      await contract.setSale(false, { from: owner });
      assert.equal(await contract.isSaleStarted(), false);
    });
  });

  describe("initRevealTimeStamp function", () => {
    it("onlyOwner", async () => {
      await contract.initRevealTimeStamp({ from: owner });
      await expectRevert(
        contract.initRevealTimeStamp({ from: acc1 }),
        "Ownable: caller is not the owner"
      );
    });
    it("Sets value correctly", async () => {
      const initRevealTimeStamp = await contract.initRevealTimeStamp({
        from: owner,
      });
      const actualRevealTimeStamp = await contract.revealTimeStamp();

      const blockTimeStamp = (await web3.eth.getBlock(15)).timestamp;
      const tenDays = 86400 * 10;
      const expectedRevealTimeStamp = blockTimeStamp + tenDays;

      assert.equal(
        actualRevealTimeStamp.toString(),
        expectedRevealTimeStamp.toString()
      );
    });
  });
  describe("setProvenance function", () => {
    it("onlyOwner", async () => {
      await contract.setProvenance("testing", { from: owner });
      await expectRevert(
        contract.setProvenance("testing", { from: acc1 }),
        "Ownable: caller is not the owner"
      );
    });
    it("Sets value correctly", async () => {
      await contract.setProvenance("testing 1", { from: owner });
      assert.equal(await contract.provenance(), "testing 1");
      await contract.setProvenance("testing 2", { from: owner });
      assert.equal(await contract.provenance(), "testing 2");
    });
  });

  describe("setBaseURI function & tokenURI", () => {
    it("onlyOwner", async () => {
      await contract.setBaseURI("baseuri.com/", { from: owner });
      await expectRevert(
        contract.setBaseURI("baseuri.com/", { from: acc1 }),
        "Ownable: caller is not the owner"
      );
    });
    it("Sets value correctly", async () => {
      await contract.setSale(true, { from: owner });
      const val = web3.utils.toWei("0.03");
      await contract.mintCyclopes(1, { from: acc1, value: val });

      await contract.setBaseURI("baseuri.com/", { from: owner });
      assert.equal(await contract.tokenURI("0"), "baseuri.com/0");
    });
  });

  // describe("getCurrentMintLimit function", () => {
  //   it("Reverts expectedly when sale is not started", async () => { //TODO perhaps add revert test for totalSupply < maxSupply

  //     console.log("baaaaaaaa")
  //     console.log(await contract.isSaleStarted())
  //     await expectRevert(
  //       contract.getCurrentMintLimit(),
  //       "Mint limit unavailable because sale is not open"
  //     );
  //     await contract.setSale(true, { from: owner });
  //     assert.equal(await contract.getCurrentMintLimit(), 5);
  //   });
  //   it("Returns appropriate result when in each tier", async () => {

  //     // Opening sale (to enable calling function)
  //     await contract.setSale(true, { from: owner });

  //     // Testing tier 1 floor
  //     const returnedTier1MintLimit = await contract.getCurrentMintLimit();
  //     assert.equal(returnedTier1MintLimit, mintTier1Limit)

  //     // Minting tokens to reach tier 1 roof
  //     await mintAllTokensForTier(tier1Roof, tier1Price, mintTier1Limit)
  //     await mintAllTokensForTier(tier2Roof, tier2Price, mintTier1Limit)
  //     const tier3RoofLess1 = tier3Roof - 1; // to enable testing tier 1 roof
  //     await mintAllTokensForTier(tier3RoofLess1, tier3Price, mintTier1Limit)

  //     // Testing tier 1 roof
  //     const returnedTier1MintLimit2 = Number(await contract.getCurrentMintLimit());
  //     assert.equal(returnedTier1MintLimit2, mintTier1Limit)

  //     // Completing token minting for tier (see tier3RoofLess1)
  //     await contract.mintCyclopes(1, {value: tier3Price})

  //     // checking next tier is reached (roof of previous tier)
  //     const currentTotalSupply = Number(await contract.totalSupply())
  //     assert.equal(currentTotalSupply, tier3Roof)

  //     // Testing tier 2
  //     const returnedTier2MintLimit = await contract.getCurrentMintLimit();
  //     assert.equal(returnedTier2MintLimit, mintTier2Limit)

  //   }).timeout(40000);
  // });

  describe("getCurrentPrice function", () => {
    it("Reverts expectedly when sale is not started", async () => { //TODO perhaps add revert test for totalSupply < maxSupply
      await expectRevert(
        contract.getCurrentPrice(),
        "Price unavailable because sale is not open"
      );
      await contract.setSale(true, { from: owner });
      assert.equal(await contract.getCurrentPrice(), tier1Price);
    });

    it("Returns appropriate result when in each tier", async () => {
      await contract.setSale(true, {from: owner})



      //tier1Roof // 74 // I should be able to deduct 1 or 2 here if I want to
      // mintTier1Limit // 5
      let totalMintQty = tier1Roof;
      let fullRuns = Math.floor(totalMintQty / mintTier1Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      let partialRuns = totalMintQty % mintTier1Limit // remainder (e.g. 54 of 5s is 4)




      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(5, {value: tier1Price * 5})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier1Price * partialRuns})
      }


      totalMintQty = tier2Roof - tier1Roof - 1; //TODO remove -1?
      fullRuns = Math.floor(totalMintQty / mintTier1Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier1Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(5, {value: tier2Price * 5})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier2Price * partialRuns})
      }
      await contract.mintCyclopes(1, {value: tier2Price})

      totalMintQty = tier3Roof - tier2Roof;
      fullRuns = Math.floor(totalMintQty / mintTier1Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier1Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(5, {value: tier3Price * 5})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier3Price * partialRuns})
      }

      totalMintQty = tier4Roof - tier3Roof;
      fullRuns = Math.floor(totalMintQty / mintTier2Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier2Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(10, {value: tier4Price * 10})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier4Price * partialRuns})
      }

      totalMintQty = tier5Roof - tier4Roof;
      fullRuns = Math.floor(totalMintQty / mintTier2Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier2Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(10, {value: tier5Price * 10})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier5Price * partialRuns})
      }


      totalMintQty = tier6Roof - tier5Roof;
      fullRuns = Math.floor(totalMintQty / mintTier2Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier2Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(10, {value: tier6Price * 10})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier6Price * partialRuns})
      }

      totalMintQty = tier7Roof - tier6Roof;
      fullRuns = Math.floor(totalMintQty / mintTier2Limit) // number of 5s or 10s to run (e.g. 50 of 5s is 10)
      partialRuns = totalMintQty % mintTier2Limit // remainder (e.g. 54 of 5s is 4)
      for (let i=0; i<fullRuns; i++) {
        await contract.mintCyclopes(10, {value: tier7Price * 10})
      }
      if (partialRuns > 0) {
        await contract.mintCyclopes(partialRuns, {value: tier7Price * partialRuns})
      }

      // await contract.mintCyclopes(1, {value: tier7Price * 1}) // expect revert

    }).timeout(150000);
  })












});
