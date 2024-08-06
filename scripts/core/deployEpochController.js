const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployEpochController() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const network = getNetwork();
    await deployProxy("EpochController", undefined, undefined, "EpochController", "initialize", [getDeployFilteredInfo("MinterUpgradeable").proxy, getDeployFilteredInfo("VoterV2_1").proxy])
}

module.exports = deployEpochController;
