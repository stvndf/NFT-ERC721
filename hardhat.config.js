require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter"); // https://github.com/cgewecke/hardhat-gas-reporter/tree/buidler-final#buidler-gas-reporter

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.3",
  networks: {
    hardhat: {
      accounts: {
        count: 4,
        accountsBalance: "100000000000000000000",
      },
    },
    ganache: {
      url: "http://127.0.0.1:7545",
    },
  },
  gasReporter: {
    enabled: false,
  },
};
