# Script instructions

Before deploying to a network, update .env to contain PRIVATE_KEY, ADDRESS, RINKERBY_URL*, MAINNET_URL*, ETHERSCAN_API**. BASE_URI can be updated later. CONTRACT_ADDRESS must be updated later.

- In the command line, ensure you are in the NFT-CYCLOPES directory

- Install dependencies:
npm install

- To deploy (and compile) the contract (saves output, including contract address, into the txt file):
`npx hardhat run --network NETWORK .\scripts\deploy-contract.js > deploy-contract.txt`

- Update CONTRACT_ADDRESS in .env with the contract address from deploy-contract.txt

- To verify the contract:
`npx hardhat run --network NETWORK .\scripts\verify-contract.js`

- To mint initial 14 tokens:
`npx hardhat run --network NETWORK .\scripts\mint-tokens.js`

- If BASE_URI has not yet been set in .env, set it

- To set base URI (remember to append '/'):
`npx hardhat run --network NETWORK .\scripts\set-uri.js`

Wherever 'NETWORK' appears in a command, substitute it with either 'rinkerby' or 'mainnet' (no apostraphes)

*Sign up on alchemyapi.io to obtain API keys for Rinkerby (another testnet would also work) and mainnet.

**Sign up on etherscan.io and obtain API key by clicking on your username on the top right and selecting API keys option
