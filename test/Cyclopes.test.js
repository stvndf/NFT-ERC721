const { web3 } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

const Contract = artifacts.require("Cyclopes");

// Traditional Truffle test
contract("Cyclopes", (accounts) => {
  const [owner, acc1] = accounts;
  let contract;

  beforeEach(async () => {
    contract = await Contract.new();
  });
  // it("setSale", async () => {
  //   await contract.setSale(true);
  //   const qty = 5;
  //   const val = web3.utils.toWei("0.03", "ether");
  //   console.log("val:", val);
  //   const x1 = await contract.mintCyclopes(qty, {
  //     from: acc1,
  //     value: val * qty,
  //   });

  //   const x2 = await contract.withdraw({ from: owner });
  //   let a1 = await web3.eth.getBalance(owner);
  //   console.log(web3.utils.fromWei(a1));
  //   let a2 = await web3.eth.getBalance(acc1);
  //   console.log(web3.utils.fromWei(a2));
  // });

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

  describe("getCurrentMintLimit function", () => {
    it("Reverts expectedly", async () => {
      await expectRevert(
        contract.getCurrentMintLimit(),
        "Mint limit unavailable because sale is not open"
      );
      await contract.setSale(true, { from: owner });
      assert.equal(await contract.getCurrentMintLimit(), 5);
    });
    it("Returns appropriate result when next tier is reached", async () => {
      await contract.setSale(true, { from: owner });

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

      const mintTier1Roof = 902;
      const mintTier2Roof = tier7Roof // maxSupply

      const mintTier1Limit = 5;

      let currentSupply = 0;


      while (currentSupply < tier1Roof) {
        /*
          Determining mint quantity (in order to not exceed tier mint quantity limit). 
          Example:
            (8 tierRoof) - (5 currentSupply) = (3 to mint)
            If default mintQty is higher than 3, it'll be lowered to 3
        */
        let mintQty;
        if ((tier1Roof - currentSupply) < mintTier1Limit) {
          mintQty = tier1Roof - currentSupply;
        } else {
          mintQty = mintTier1Limit;
        }

        if (mintQty < mintTier1Limit) {
          await contract.mintCyclopes(mintQty, {value: web3.utils.toWei("0.03") * mintQty}); //TODO update price to be variable
        } else {
          await contract.mintCyclopes(mintQty, {value: web3.utils.toWei("0.03") * mintQty}); // change to use tier1Price and tier1Roof

        }
        currentSupply += mintQty;
      }

      await contract.mintCyclopes(1, {value: web3.utils.toWei("0.05") * 1}); //TODO insert expectRevert, before that assert totalSupply to confirm it

      async function mintAllTokensForTier(tierRoof, tierPrice, mintTierLimit) {
        while (currentSupply < tierRoof) {
          console.log("inside")
          /*
            Determining mint quantity (in order to not exceed tier mint quantity limit). 
            Example:
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
          console.log("currentSupply:%s \ttierRoof: %s")
        }
      }

      await mintAllTokensForTier(tier2Roof, tier2Price, mintTier1Limit)
      await contract.mintCyclopes(1, {value: web3.utils.toWei("0.05") * 1}); //TODO insert expectRevert, before that assert totalSupply to confirm it

    });
  });










  
  // describe("getCurrentPrice function", () => {
  //   it("Reverts expectedly", async () => {
  //     await expectRevert(
  //       contract.getCurrentPrice(),
  //       "Mint limit unavailable because sale is not open"
  //     );
  //     await contract.setSale(true, { from: owner });
  //     assert.equal(
  //       await contract.getCurrentPrice(),
  //       web3.utils.toWei("0.03", "ether")
  //     );
  //   });
  // });
});
