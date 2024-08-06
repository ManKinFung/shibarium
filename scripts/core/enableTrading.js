const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function enableEmission() {
    const tokenContract = await contractAt("Shipe", getDeployFilteredInfo("Shipe").proxy)
    await sendTxn(tokenContract.launch(), "launched token to enable transfer")

    // add liquidity
    // ...

    await sendTxn(tokenContract.setSwapTokensAtAmount(ethers.utils.parseEther('token amount to swap fee to ETH')), "set LP address to take fee")
    await sendTxn(tokenContract.setAutomatedMarketMakerPair('lp address', true), "set LP address to take fee")
}

module.exports = enableEmission;
