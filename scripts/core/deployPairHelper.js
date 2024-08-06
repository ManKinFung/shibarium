const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployPairHelper() {
    await deployContract("PairHelper", [getDeployFilteredInfo("Router").imple])
}

module.exports = deployPairHelper;
