const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployMinter() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const network = getNetwork();
    const minter = await deployProxy("MinterUpgradeable", undefined, undefined, "MinterUpgradeable", "initialize", [getDeployFilteredInfo("VoterV2_1").proxy, getDeployFilteredInfo("VotingEscrow").imple, getDeployFilteredInfo("RewardsDistributor").imple])

    const shipeContract = await contractAt("Shipe", getDeployFilteredInfo("Shipe").proxy)
    await sendTxn(shipeContract.setMinter(minter.address), "shipeContract.setMinter(minter.address)")
    const voter2 = await contractAt("VoterV2_1", getDeployFilteredInfo("VoterV2_1").proxy)
    await sendTxn(voter2.setMinter(minter.address), "voter2.setMinter(minter.address)")
    const rewardsDistributor = await contractAt("RewardsDistributor", getDeployFilteredInfo("RewardsDistributor").imple)
    await sendTxn(rewardsDistributor.setDepositor(minter.address), "rewardsDistributor.setDepositor(minter.address)")
}

module.exports = deployMinter;
