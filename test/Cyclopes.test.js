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
  const mintTier2Roof = 5255; // maxSupply
  async function batchMint(quantityToMint, tierPrice, mintTierLimit) {
    console.log("Number of NFTs minting:", quantityToMint);

    // A full run is the mintTierLimit. Remainder is between 0 & mintTierLimit
    let fullRuns = Math.floor(quantityToMint / mintTierLimit); // number of 5s or 10s to run (e.g. 50 of 5s is 10)
    let remainder = quantityToMint % mintTierLimit; // e.g. 54 of 5s is 4

    for (let i = 0; i < fullRuns; i++) {
      await contract.mintCyclopes(mintTierLimit, {
        value: tierPrice * mintTierLimit,
      });
    }
    if (remainder > 0) {
      await contract.mintCyclopes(remainder, {
        value: tierPrice * remainder,
      });
    }
    console.log(
      `Batch complete (${quantityToMint} minted). Current total supply: ${await contract.totalSupply()}`
    );
  }

  beforeEach(async () => {
    contract = await Contract.new();
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
      await contract.initRevealTimeStamp({ from: owner });
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
    it("Reverts expectedly when sale is not started", async () => {
      await expectRevert(
        contract.getCurrentMintLimit(),
        "Mint limit unavailable because sale is not open"
      );
      await contract.setSale(true, { from: owner });
      assert.equal(await contract.getCurrentMintLimit(), 5);
    });
    it("Returns appropriate result when in each tier", async () => {
      // Opening sale (to enable calling function)
      await contract.setSale(true, { from: owner });

      // Testing tier floor
      const returnedTier1MintLimit1 = await contract.getCurrentMintLimit();
      assert.equal(returnedTier1MintLimit1, mintTier1Limit);

      // Minting tokens to reach tier roof
      await batchMint(tier1Roof, tier1Price, mintTier1Limit);
      await batchMint(tier2Roof - tier1Roof, tier2Price, mintTier1Limit);
      const tier3RoofLess1 = tier3Roof - tier2Roof - 1; // deduct 1 for roof test
      await batchMint(tier3RoofLess1, tier3Price, mintTier1Limit);

      // Testing tier roof
      const returnedTier1MintLimit2 = await contract.getCurrentMintLimit();
      assert.equal(returnedTier1MintLimit2, mintTier1Limit);

      // Completing token minting for tier
      await contract.mintCyclopes(1, { value: tier3Price });

      // Testing tier 2
      const returnedTier2MintLimit = await contract.getCurrentMintLimit();
      assert.equal(returnedTier2MintLimit, mintTier2Limit);
    }).timeout(40000);
  });

  describe("getCurrentPrice function", () => {
    it("Reverts expectedly when sale is not started", async () => {
      await expectRevert(
        contract.getCurrentPrice(),
        "Price unavailable because sale is not open"
      );
      await contract.setSale(true, { from: owner });
      assert.equal(await contract.getCurrentPrice(), tier1Price);
    });

    it("Returns appropriate result when in each tier", async () => {
      await contract.setSale(true, { from: owner });

      async function testPriceForTier(
        tierRoof,
        prevTierRoof,
        tierPrice,
        mintTierLimit,
        finalTier = false
      ) {
        // Testing tier floor
        const returnedtierPriceAtFloor = await contract.getCurrentPrice();
        assert.equal(String(returnedtierPriceAtFloor), tierPrice);

        // Minting tokens to reach tier roof
        const tierRoofLess1 = tierRoof - prevTierRoof - 1; // deduct 1 for roof test
        await batchMint(tierRoofLess1, tierPrice, mintTierLimit);

        // Testing tier roof
        const returnedtierPriceAtRoof = Number(
          await contract.getCurrentPrice()
        );
        assert.equal(returnedtierPriceAtRoof, tierPrice);

        // Completing token minting for tier
        await contract.mintCyclopes(1, { value: tierPrice });

        if (finalTier === false) {
          // Next tier token should fail at previous price
          await expectRevert(
            contract.mintCyclopes(1, { value: tierPrice }),
            "Ether submitted does not match current price"
          );
        } else {
          // Next tier should fail as it doesn't exist
          await expectRevert(
            contract.mintCyclopes(1, { value: tierPrice }),
            "Mint limit unavailable because sale is not open"
          );
        }
      }
      await testPriceForTier(tier1Roof, 0, tier1Price, mintTier1Limit);
      await testPriceForTier(tier2Roof, tier1Roof, tier2Price, mintTier1Limit);
      await testPriceForTier(tier3Roof, tier2Roof, tier3Price, mintTier1Limit);
      await testPriceForTier(tier4Roof, tier3Roof, tier4Price, mintTier2Limit);
      await testPriceForTier(tier5Roof, tier4Roof, tier5Price, mintTier2Limit);
      await testPriceForTier(tier6Roof, tier5Roof, tier6Price, mintTier2Limit);
      await testPriceForTier(
        tier7Roof,
        tier6Roof,
        tier7Price,
        mintTier2Limit,
        true
      );
    }).timeout(150000);
  });

  describe("mintCyclopes function", () => {
    it("Mint quantity must be within bounds (minimum and max)", async () => {
      contract.setSale(true, {from: owner})

      // Price tier 1 test
      await contract.mintCyclopes(1, {value: tier1Price}) // expect success
      await expectRevert(
        contract.mintCyclopes(0, {value: tier1Price}),
        "Must mint at least 1"
      )
      await expectRevert(
        contract.mintCyclopes(6, {value: tier1Price * 6}),
        "Maximum current buy limit for individual transaction exceeded"
      )

      // Minting tokens to reach next tier
      const tier1RoofLess1 = tier1Roof - 1; // already minted 1
      await batchMint(tier1RoofLess1, tier1Price, mintTier1Limit);
      await batchMint(tier2Roof - tier1Roof, tier2Price, mintTier1Limit);
      await batchMint(tier3Roof - tier2Roof, tier3Price, mintTier1Limit);

      // Price tier 2 test
      await contract.mintCyclopes(10, {value: tier4Price * 10}) // expect success
      await expectRevert(
        contract.mintCyclopes(0, {value: tier4Price}),
        "Must mint at least 1"
      )
      await expectRevert(
        contract.mintCyclopes(11, {value: tier4Price * 11}),
        "Maximum current buy limit for individual transaction exceeded"
      )
    }).timeout(150000);
  })

  describe("withdraw function", () => {
    it("onlyOwner", async () => {
      await contract.setSale({ from: owner });
      await contract.mintCyclopes(1, { value: tier1Price });
      await expectRevert(
        contract.withdraw({ from: acc1 }),
        "Ownable: caller is not the owner"
      );
      await contract.withdraw({ from: owner }); // expect success
    });
    it("Requires a positive balance", async () => {
      await expectRevert(
        contract.withdraw({ from: owner }),
        "Balance must be positive"
      );
      await contract.setSale({ from: owner });
      await contract.mintCyclopes(1, { value: tier1Price });
      contract.withdraw({ from: owner }); // expect success
    });

    it("Can't exceed maxValue", async () => {
      await contract.setSale(true, { from: owner });

      assert.equal(await contract.maxSupply(), tier7Roof); // checking that maxSupply is tier7Roof

      // Minting tokens to reach maxSupply (tier7Roof)
      await batchMint(tier1Roof, tier1Price, mintTier1Limit);
      await batchMint(tier2Roof - tier1Roof, tier2Price, mintTier1Limit);
      await batchMint(tier3Roof - tier2Roof, tier3Price, mintTier1Limit);
      await batchMint(tier4Roof - tier3Roof, tier4Price, mintTier2Limit);
      await batchMint(tier5Roof - tier4Roof, tier5Price, mintTier2Limit);
      await batchMint(tier6Roof - tier5Roof, tier6Price, mintTier2Limit);
      await batchMint(tier7Roof - tier6Roof, tier7Price, mintTier2Limit);

      assert.equal(Number(await contract.totalSupply()), tier7Roof); // checking maxSupply reached

      await expectRevert(
        contract.mintCyclopes(1, { value: tier7Price }),
        "Mint limit unavailable because sale is not open"
      );
    }).timeout(150000);
  });
});
