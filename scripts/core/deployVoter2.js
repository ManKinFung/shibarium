const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployVoter2() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const network = getNetwork();
    const voter = await deployProxy("VoterV2_1", undefined, undefined, "VoterV2_1", "initialize", [getDeployFilteredInfo("VotingEscrow").imple, getDeployFilteredInfo("PairFactory").proxy, getDeployFilteredInfo("GaugeFactoryV2").proxy, getDeployFilteredInfo("BribeFactoryV3").proxy])

    const votingEscrow = await contractAt("VotingEscrow", getDeployFilteredInfo("VotingEscrow").imple)
    await sendTxn(votingEscrow.setVoter(voter.address), "votingEscrow.setVoter(voter.address)")

    const voterContract = await contractAt("VoterV2_1", voter.address)
    await sendTxn(voterContract.setUSDR(getDeployFilteredInfo("WBONE").imple), "voterContract.setUSDR(WBONE)")
    const whitelistArray = voterContract["whitelist(address[])"]
    await sendTxn(whitelistArray([
        getDeployFilteredInfo("Shipe").proxy,
        getDeployFilteredInfo("WBONE").imple,
        // getDeployFilteredInfo("USDT").proxy,
        // getDeployFilteredInfo("USDC").proxy,
    ]), "voterContract.whitelist([Shipe, WBONE, DAI, USDC, USDT, USDR, old USDR])")
    // 0x8f3cf7ad23cd3cadbd9735aff958023239c6a063(DAI), 0x2791bca1f2de4661ed88a30c99a7a9449aa84174(USDC), 0xb5dfabd7ff7f83bab83995e72a52b97abb7bcf63(USDR), 0xc2132d05d31c914a87c6611c10748aeb04b58e8f(USDT), 0xaf0d9d65fc54de245cda37af3d18cbec860a4d4b(old USDR)

    // https://polygonscan.com/tx/0x894d157e997fe3bc261a8bbaddb8bfb414b7ea481b56c1d4b906090942a3fc0b
    // USDRRebaseProxy.setVoter

    const bribeFactoryV3 = await contractAt("BribeFactoryV3", getDeployFilteredInfo("BribeFactoryV3").proxy)
    await sendTxn(bribeFactoryV3.setVoter(voter.address), "bribeFactoryV3.setVoter(voter.address)")
}

module.exports = deployVoter2;
