import "dotenv/config";

import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-dependency-compiler";
import {HardhatUserConfig} from "hardhat/config";

import "./tasks/index";

const DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error("private key not found");
}
/*
 * You need to export an object to set up your config
 * Go to https://hardhat.org/config/ to learn more
 */

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const config: HardhatUserConfig = {
    dependencyCompiler: {
        paths: [
            "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol",
            "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
            "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
        ], // ,
        // keep: true
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                },
            },
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                    evmVersion: "shanghai",
                },
            },
            {
                version: "0.6.11",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                },
            },
            {
                version: "0.5.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                },
            },
        ],
        overrides: {
            "contracts/v2/PolygonRollupManager.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 500,
                    },
                    evmVersion: "shanghai",
                }, // try yul optimizer
            },
            "contracts/v2/PolygonZkEVMBridgeV2.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999,
                    },
                    evmVersion: "shanghai",
                },
            },
            "contracts/v2/newDeployments/PolygonRollupManagerNotUpgraded.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 500,
                    },
                    evmVersion: "shanghai",
                }, // try yul optimizer
            },
            "contracts/v2/mocks/PolygonRollupManagerMock.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 10,
                    },
                    evmVersion: "shanghai",
                }, // try yul optimizer
            },
            // Should have the same optimizations than the RollupManager to verify
            "contracts/v2/lib/PolygonTransparentProxy.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 500,
                    },
                    evmVersion: "shanghai",
                }, // try yul optimizer
            },
            "contracts/v2/utils/ClaimCompressor.sol": {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 999999,
                    },
                    evmVersion: "shanghai",
                    //viaIR: true,
                },
            },
        },
    },
    networks: {
        rsk: {
            url: "https://rsk-rpc-1.biteigen.xyz",
            chainId: 31,
            accounts: [`0x${privateKey}`],
        },
        hardhat: {
            initialDate: "0",
            allowUnlimitedContractSize: true,
            initialBaseFeePerGas: 0,
            accounts: {
                mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
        },
        polygonZKEVMTestnet: {
            url: "https://rpc.cardona.zkevm-rpc.com",
            accounts: {
                mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
        },
        polygonZKEVMMainnet: {
            url: "https://zkevm-rpc.com",
            accounts: {
                mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
        },
        zkevmDevnet: {
            url: "http://123:123:123:123:123",
            accounts: {
                mnemonic: process.env.MNEMONIC || DEFAULT_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [`0x${privateKey}`],
            // gasPrice: 5000000000,
            // gasPrice: "auto",
        },
        biteigen: {
            url: "https://rpc-1.biteigen.xyz",
            chainId: 1011,
            accounts: [`0x${privateKey}`],
        }
    },
    gasReporter: {
        enabled: !!process.env.REPORT_GAS,
        outputFile: process.env.REPORT_GAS_FILE ? "./gas_report.md" : undefined,
        noColors: !!process.env.REPORT_GAS_FILE,
    },
    etherscan: {
        apiKey: {
            polygonZKEVMTestnet: `${process.env.ETHERSCAN_ZKEVM_API_KEY}`,
            polygonZKEVMMainnet: `${process.env.ETHERSCAN_ZKEVM_API_KEY}`,
            rsk: `${process.env.RSK_API_KEY}`,
            bscTestnet: `${process.env.BSCSCAN_API_KEY}`,
            biteigen: "biteigen",
        },
        customChains: [
            {
                network: "polygonZKEVMMainnet",
                chainId: 1101,
                urls: {
                    apiURL: "https://api-zkevm.polygonscan.com/api",
                    browserURL: "https://zkevm.polygonscan.com/",
                },
            },
            {
                network: "polygonZKEVMTestnet",
                chainId: 2442,
                urls: {
                    apiURL: "https://explorer-ui.cardona.zkevm-rpc.com/api",
                    browserURL: "https://explorer-ui.cardona.zkevm-rpc.com",
                },
            },
            {
                network: "zkevmDevnet",
                chainId: 123,
                urls: {
                    apiURL: "http://123:123:123:123:123/api",
                    browserURL: "http://123:123:123:123:123",
                },
            },
            {
                network: "zkevmDevnet",
                chainId: 123,
                urls: {
                    apiURL: "http://123:123:123:123:123/api",
                    browserURL: "http://123:123:123:123:123",
                },
            },
            {
                network: "biteigen",
                chainId: 1011,
                urls: {
                    apiURL: "https://explorer-1.biteigen.xyz/api",
                    browserURL: "https://explorer-1.biteigen.xyz/",
                },
            },
        ],
    },
};

export default config;
