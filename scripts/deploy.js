// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { deploy_localhost } = require("./networks/localhost")
const { setNetwork } = require("./shared/syncParams");
const { deploy_goerli } = require("./networks/goerli");
const { deploy_shibarium } = require("./networks/shibarium");

async function main() {
  const accounts = await hre.ethers.getSigners()
  const provider = hre.ethers.provider

  for (const account of accounts) {
    console.log(
      "%s (%i ETH)",
      account.address,
      hre.ethers.utils.formatEther(
        // getBalance returns wei amount, format to ETH amount
        await provider.getBalance(account.address)
      )
    );
  }

  setNetwork(hre.network.name)

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    await deploy_localhost()
  } else if (hre.network.name === "core") {
    await deploy_core()
  } else if (hre.network.name === "goerli") {
    await deploy_goerli()
  } else if (hre.network.name === "shibarium") {
    await deploy_shibarium()
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
