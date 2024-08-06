require("@nomiclabs/hardhat-waffle");

require('@openzeppelin/hardhat-upgrades');

require("@nomiclabs/hardhat-etherscan");

require("@nomiclabs/hardhat-web3");

const { PRIVATEKEY, APIKEY } = require("./pvkey.js")

module.exports = {
  // latest Solidity version
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },

  networks: {
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: PRIVATEKEY
    },

    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: PRIVATEKEY
    },

    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/4qdi54Bjo9saX6OVnWYk_WiBQlrcP0-2",
      chainId: 5,
      gasPrice: 20,
      accounts: PRIVATEKEY
    },

    shibarium: {
      url: 'https://www.shibrpc.com/',
      chainId: 109,
      accounts: PRIVATEKEY
    },

    localhost: {
      url: 'http://127.0.0.1:8545/',
      timeout: 120000,
      accounts: {
        mnemonic: "near cruel jar space pond motion evidence shed coach more drama pyramid",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
  
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      shibarium: APIKEY,
    },
    customChains: [
      {
        network: "shibarium",
        chainId: 109,
        urls: {
          apiURL: "https://shibariumscan.io/api/",
          browserURL: "https://shibariumscan.io/"
        }
      }
    ]
  },

  mocha: {
    timeout: 100000000
  }

}