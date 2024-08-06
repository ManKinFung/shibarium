const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function enableEmission() {
    const minterContract = await contractAt("MinterUpgradeable", getDeployFilteredInfo("MinterUpgradeable").proxy)
    await sendTxn(minterContract._initialize(), "initialize minter")
}

module.exports = enableEmission;
