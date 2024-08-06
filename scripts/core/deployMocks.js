const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployMocks() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const usdt = await deployProxy("MockToken", undefined, undefined, "USDT", 'initialize', ['Mock USDT', 'mUSDT'])
    const usdc = await deployProxy("MockToken", undefined, undefined, "USDC", 'initialize', ['Mock USDC', 'mUSDC'])

    const usdtContract = await contractAt("MockToken", usdt.address)
    await sendTxn(usdtContract.mint(tokenManagerAddr, '100000000000000000000000000000'), "Mint 1 mil USDT")

    const usdcContract = await contractAt("MockToken", usdc.address)
    await sendTxn(usdcContract.mint(tokenManagerAddr, '100000000000000000000000000000'), "Mint 1 mil USDC")
}

module.exports = deployMocks;
