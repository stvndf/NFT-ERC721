require("@nomiclabs/hardhat-truffle5");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.3",
  networks: {
    hardhat: {
      accounts: {
        count: 4,
      },
    },
  },
};
