const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployAPI() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const network = getNetwork();
    const pairAPI = await deployProxy("PairAPI", undefined, undefined, "PairAPI", "initialize", [getDeployFilteredInfo("VoterV2_1").proxy])
    await deployProxy("RewardAPI", undefined, undefined, "RewardAPI", "initialize", [getDeployFilteredInfo("VoterV2_1").proxy])
    await deployProxy("veNFTAPI", undefined, undefined, "veNFTAPI", "initialize", [getDeployFilteredInfo("VoterV2_1").proxy, getDeployFilteredInfo("RewardsDistributor").imple, pairAPI.address, getDeployFilteredInfo("PairFactory").proxy])
}

module.exports = deployAPI;
