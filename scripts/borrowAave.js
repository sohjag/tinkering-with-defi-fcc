const { getWeth, AMOUNT } = require("../scripts/getWeth")
const { getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    // console.log(`Inside borrowAave`)
    // console.log(`Deployer is ${deployer}`)
    await getWeth()
    const account = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

    //lending pool address provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer)
    console.log(`Lending pool address is: ${lendingPool.address}`)

    //approve tokens
    const wethTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    //deposit
    console.log("Depositing tokens...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited the amount!")

    //check user data, like how much can be borrowed, collateral, etc
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)

    //above data is in ETH so need to get the price in DAI
    const price = await getDaiPrice()

    //calculate how much to borrow
    const amountToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / price.toNumber())
    console.log(`Amount to borrow is ${amountToBorrow}`)

    //borrow amount in wei
    const amountToBorrowWei = ethers.utils.parseEther(amountToBorrow.toString())
    console.log(`Amount to borrow in wei is ${amountToBorrowWei}`)

    //borrow time!!
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrow(daiTokenAddress, lendingPool, amountToBorrowWei, deployer)

    //time to repay the loan
    await repay(amountToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Amount repaid!")
}

async function borrow(daiAddress, lendingPool, amountToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("Borrow successful!")
}

async function getDaiPrice() {
    //DAI-ETH price feed chainlink (ETH mainnet): 0x773616E4d11A78F511299002da57A0a94577F1f4
    const priceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4",
    )
    const price = (await priceFeed.latestRoundData())[1]
    console.log(`The DAI-ETH price is ${price}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have total ${totalCollateralETH} ETH Deposited`)
    console.log(`You have total ${totalDebtETH} ETH borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveErc20(contractAddress, approveForAddress, amountToSpend, account) {
    const erc20Contract = await ethers.getContractAt("IERC20", contractAddress, account)
    const approve = await erc20Contract.approve(approveForAddress, amountToSpend)
    await approve.wait(1)
    console.log("Approved")
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account,
    )

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
    })
