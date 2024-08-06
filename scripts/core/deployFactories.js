const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const {
    getFrameSigner,
    deployContract,
    deployProxy,
    contractAt,
    sendTxn
} = require("../shared/helpers");
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams");

async function deployFactories() {
    await deployProxy("GaugeFactoryV2", undefined, undefined, "GaugeFactoryV2", "initialize", [])
    await deployProxy("BribeFactoryV3", undefined, undefined, "BribeFactoryV3", "initialize",
        [
            ZERO_ADDRESS,
            [
                getDeployFilteredInfo("Shipe").proxy,
                getDeployFilteredInfo("WBONE").imple,
                // getDeployFilteredInfo("USDT").proxy,
                // getDeployFilteredInfo("USDC").proxy,
            ]
        ]
    ) // 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063(DAI), 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174(USDC), 0xc2132D05D31c914a87C6611C10748AEb04B58e8F(USDT), 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270(WMATIC), 0xAF0D9D65fC54de245cdA37af3d18cbEc860A4D4b(wUSDR)
}

module.exports = deployFactories;
