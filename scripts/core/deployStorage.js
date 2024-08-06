const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployStorage() {
    await deployProxy("Storage", undefined, undefined, "Storage", "initialize", [])
}

module.exports = deployStorage;
