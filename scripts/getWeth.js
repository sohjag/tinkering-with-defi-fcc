const { getNamedAccounts, ethers, network } = require("hardhat")
const { parseEther } = require("ethers-utils")
const { networkConfig } = require("../helper-hardhat.config")

const AMOUNT = ethers.utils.parseEther("10")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    console.log(deployer)
    console.log("getting contract object...")
    console.log()
    const wethContract = await ethers.getContractAt(
        "IWeth",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        deployer,
    )
    //console.log(await wethContract.getAddress())
    console.log("contract retrieved...")
    console.log("sending amount...")
    console.log(AMOUNT)
    const txResponse = await wethContract.deposit({ value: AMOUNT })
    await txResponse.wait(1)
    console.log(txResponse)
    console.log(deployer)
    const balance = await wethContract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    console.log(`Weth balance of deployer is ${balance}`)
}

module.exports = { getWeth, AMOUNT }
