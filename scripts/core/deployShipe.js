const { ethers } = require("hardhat");
const {
    getFrameSigner,
    getExSigner,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployShipe() {
    const signer = await getFrameSigner();
    const tokenManagerAddr = signer.address;

    const treasury = {
        address: '0x1a99a93FE99e7d0baEa4901049e69Bf716b43354'
    }

    const network = getNetwork();
    const tokenInfo = await deployProxy("Shipe", undefined, undefined, "Shipe", "initialize", [getDeployFilteredInfo("Router").imple, treasury.address])
    const tokenContract = await contractAt("Shipe", tokenInfo.address)
    await sendTxn(tokenContract.mint(tokenManagerAddr, ethers.utils.parseEther('50000000')), "Mint 50 mil Shipe")

    // const factoryContract = await contractAt("PairFactory", getDeployFilteredInfo("PairFactory").proxy)
    // await sendTxn(factoryContract.createPair(tokenInfo.address, getDeployFilteredInfo("WBONE").imple, false), "Create a Shipe LP");
    // const pair = await factoryContract.getPair(tokenInfo.address, getDeployFilteredInfo("WBONE").imple, false)
    // await sendTxn(tokenContract.setAutomatedMarketMakerPair(pair, true), `Set Shipe pair ${pair}`)
    await sendTxn(tokenContract.setSwapTokensAtAmount("10000"), `Set swap amount to 10k`)

    // // simulation
    // console.log('')
    // console.log('')
    // console.log('')
    // console.log('')
    // console.log('Simulating...')
    // console.log('')
    // const routerContract = await contractAt("Router", getDeployFilteredInfo("Router").imple)
    // await sendTxn(tokenContract.approve(getDeployFilteredInfo("Router").imple, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), 'approving router for Shipe')
    // await sendTxn(routerContract.addLiquidityETH(tokenInfo.address, false, ethers.utils.parseEther("1000000"), 0, 0, tokenManagerAddr, '0xffffffff', {value: ethers.utils.parseEther("1")}), "Adding 1 mil Shipe and 1 ETH to LP ")

    // const user = await getExSigner(1)
    // await sendTxn(tokenContract.transfer(user.address, ethers.utils.parseEther('11000')), 'transfer 11k Shipe to account[1]')
    // await sendTxn(tokenContract.connect(user).approve(getDeployFilteredInfo("Router").imple, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), "account[1]: approving router for Shipe")
    // await sendTxn(tokenContract.launch(), 'Launching token')

    // let oldBal = await tokenContract.balanceOf(pair)
    // let oldBal2 = await tokenContract.balanceOf(tokenInfo.address)
    // await sendTxn(routerContract.connect(user).swapExactTokensForETHSupportingFeeOnTransferTokens(ethers.utils.parseEther('10000'), "0", [[tokenInfo.address, getDeployFilteredInfo("WBONE").imple, false]], user.address, '0xffffffff'), 'swap 10k Shipe for ETH')
    // let newBal = await tokenContract.balanceOf(pair)
    // let newBal2 = await tokenContract.balanceOf(tokenInfo.address)
    // console.log('LP', ethers.utils.formatEther(oldBal.toString()), ethers.utils.formatEther(newBal.toString()))
    // console.log('fee', ethers.utils.formatEther(oldBal2.toString()), ethers.utils.formatEther(newBal2.toString()))

    // oldBal = newBal
    // oldBal2 = newBal2
    // await sendTxn(routerContract.connect(user).swapExactETHForTokensSupportingFeeOnTransferTokens("0", [[getDeployFilteredInfo("WBONE").imple, tokenInfo.address, false]], user.address, '0xffffffff', {value: ethers.utils.parseEther('0.05')}), 'swap 0.05 ETH for Shipe')
    // newBal = await tokenContract.balanceOf(pair)
    // newBal2 = await tokenContract.balanceOf(tokenInfo.address)
    // console.log('LP', ethers.utils.formatEther(oldBal.toString()), ethers.utils.formatEther(newBal.toString()))
    // console.log('fee', ethers.utils.formatEther(oldBal2.toString()), ethers.utils.formatEther(newBal2.toString()))

    // oldBal2 = newBal2
    // const provider = tokenContract.provider
    // oldBal = await provider.getBalance(treasury.address)
    // await sendTxn(routerContract.connect(user).swapExactTokensForETHSupportingFeeOnTransferTokens(ethers.utils.parseEther('1'), "0", [[tokenInfo.address, getDeployFilteredInfo("WBONE").imple, false]], user.address, '0xffffffff'), 'swap 1 Shipe for ETH')
    // newBal = await provider.getBalance(treasury.address)
    // newBal2 = await tokenContract.balanceOf(tokenInfo.address)
    // console.log('fee', ethers.utils.formatEther(oldBal2.toString()), ethers.utils.formatEther(newBal2.toString()))
    // console.log('treasury', ethers.utils.formatEther(oldBal.toString()), ethers.utils.formatEther(newBal.toString()))
}

module.exports = deployShipe;
