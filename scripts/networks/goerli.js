const deployAPI = require("../core/deployAPI");
const deployAirdrop = require("../core/deployAirdrop");
const deployDex = require("../core/deployDex");
const deployEpochController = require("../core/deployEpochController");
const deployFactories = require("../core/deployFactories");
const deployMinter = require("../core/deployMinter");
const deployShipe = require("../core/deployShipe");
const deployRewardDistributor = require("../core/deployRewardDistributor");
const deployStorage = require("../core/deployStorage");
const deployVoter2 = require("../core/deployVoter2");
const { getGasUsed } = require("../shared/syncParams");
const deployMocks = require("../core/deployMocks");
const deployMulticall = require("../core/deployMulticall");
const deployPairHelper = require("../core/deployPairHelper");
const enableEmission = require("../core/enableEmission");

const deploy_goerli = async () => {
    //https://polygonscan.com/txs?a=0x839aeea3537989ce05ea1b218ab0f25e54cc3b3f&p=13
    
    // await deployMocks()
    await deployDex()
    await deployPairHelper()
    await deployShipe()
    await deployRewardDistributor()
    await deployFactories()
    await deployVoter2()
    await deployMinter()
    await deployAPI()
    await deployEpochController()
    await deployStorage()
    await deployAirdrop()
    // await deployMulticall()

    // await enableEmission()
    console.log('gas used:', getGasUsed())
};

module.exports = { deploy_goerli };
