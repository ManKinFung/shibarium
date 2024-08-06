const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployDex() {
    const factory = await deployProxy("PairFactory", undefined, undefined, "PairFactory", "initialize", [])
    const weth = await deployContract("WBONE", [])
    await deployContract("Router", [factory.address, getDeployFilteredInfo("WBONE").imple])
}

module.exports = deployDex;
