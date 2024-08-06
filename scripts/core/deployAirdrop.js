const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployAirdrop() {
    await deployContract("Airdrop", [getDeployFilteredInfo("Shipe").proxy, getDeployFilteredInfo("VotingEscrow").imple])
}

module.exports = deployAirdrop;
