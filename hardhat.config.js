require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: { url: MAINNET_RPC_URL },
            blockConfirmations: 1,
            initialBaseFeePerGas: 0,
            allowUnlimitedContractSize: true,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        // localhost: {
        //     chainId: 31337,
        //     blockConfirmations: 1,
        //     initialBaseFeePerGas: 0,
        //     allowUnlimitedContractSize: true,
        //     gas: 2100000,
        //     gasPrice: 8000000000,
        // },
        sepolia: {
            chainId: 11155111,
            blockConfirmations: 6,
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    solidity: {
        compilers: [
            { version: "0.8.18" },
            { version: "0.6.6" },
            { version: "0.4.19" },
            { version: "0.6.12" },
            { version: "0.6.12" },
            { version: "0.6.0" },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    mocha: {
        timeout: 500000, // 500 seconds max for running tests
    },
}
