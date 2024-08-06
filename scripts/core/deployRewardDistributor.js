const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployRewardDistributor() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const network = getNetwork();
    const token = getDeployFilteredInfo("Shipe")
    const veArtProxy = await deployProxy("VeArtProxyUpgradeable", undefined, undefined, "VeArtProxy", "initialize", [])
    const votingEscrow = await deployContract("VotingEscrow", [token.proxy, veArtProxy.address])
    await deployContract("RewardsDistributor", [votingEscrow.address])
}

module.exports = deployRewardDistributor;
