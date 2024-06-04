/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved */
import path = require("path");
import fs = require("fs");

import * as dotenv from "dotenv";
import {ethers} from "hardhat";
dotenv.config({path: path.resolve(__dirname, "../../.env")});

import {PolygonZkEVMDeployer} from "../../typechain-types";
import {create2Deployment} from "../helpers/deployment-helpers";
import deployOutput from "./deploy_output.json";
import deployParameters from "./deploy_parameters.json";

const pathOutputJson = path.join(__dirname, "./deploy_output.json");

async function main() {
    const polygonZkEVMBridgeAddress = deployOutput.polygonZkEVMBridgeAddress;

    if (!polygonZkEVMBridgeAddress) {
        throw new Error(`Missing polygonZkEVMBridgeAddress: ${deployOutput}`);
    }

    const {salt, zkEVMDeployerAddress} = deployParameters;
    if (!salt) throw new Error(`Missing parameter: salt`);
    if (!zkEVMDeployerAddress) throw new Error(`Missing parameter: zkEVMDeployerAddress`);

    // Load provider
    let currentProvider = ethers.provider;
    if (deployParameters.multiplierGas || deployParameters.maxFeePerGas) {
        if (process.env.HARDHAT_NETWORK !== "hardhat") {
            currentProvider = ethers.getDefaultProvider(
                `https://${process.env.HARDHAT_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
            ) as any;
            if (deployParameters.maxPriorityFeePerGas && deployParameters.maxFeePerGas) {
                console.log(
                    `Hardcoded gas used: MaxPriority${deployParameters.maxPriorityFeePerGas} gwei, MaxFee${deployParameters.maxFeePerGas} gwei`
                );
                const FEE_DATA = new ethers.FeeData(
                    null,
                    ethers.parseUnits(deployParameters.maxFeePerGas, "gwei"),
                    ethers.parseUnits(deployParameters.maxPriorityFeePerGas, "gwei")
                );

                currentProvider.getFeeData = async () => FEE_DATA;
            } else {
                console.log("Multiplier gas used: ", deployParameters.multiplierGas);
                async function overrideFeeData() {
                    const feedata = await ethers.provider.getFeeData();
                    return new ethers.FeeData(
                        null,
                        ((feedata.maxFeePerGas as bigint) * BigInt(deployParameters.multiplierGas)) / 1000n,
                        ((feedata.maxPriorityFeePerGas as bigint) * BigInt(deployParameters.multiplierGas)) / 1000n
                    );
                }
                currentProvider.getFeeData = overrideFeeData;
            }
        }
    }

    // Load deployer
    let deployer: any;
    if (deployParameters.deployerPvtKey) {
        deployer = new ethers.Wallet(deployParameters.deployerPvtKey, ethers.provider);
    } else if (process.env.MNEMONIC) {
        deployer = ethers.HDNodeWallet.fromMnemonic(
            ethers.Mnemonic.fromPhrase(process.env.MNEMONIC!),
            "m/44'/60'/0'/0/0"
        ).connect(ethers.provider);
    } else {
        [deployer] = await ethers.getSigners();
    }

    // Load zkEVM deployer
    const PolgonZKEVMDeployerFactory = await ethers.getContractFactory("PolygonZkEVMDeployer", deployer);
    const zkEVMDeployerContract = PolgonZKEVMDeployerFactory.attach(zkEVMDeployerAddress) as PolygonZkEVMDeployer;

    const polygonZkEVMNFTBridgeFactory = await ethers.getContractFactory("ZkEVMNFTBridge", deployer);
    const deployTransactionNFTBridge = (
        await polygonZkEVMNFTBridgeFactory.getDeployTransaction(polygonZkEVMBridgeAddress)
    ).data;
    // Mandatory to override the gasLimit since the estimation with create are mess up D:
    const [nftBridgeAddress, isBridgeDeployed] = await create2Deployment(
        zkEVMDeployerContract,
        salt,
        deployTransactionNFTBridge,
        null,
        deployer,
        null
    );

    if (isBridgeDeployed) {
        console.log("#######################\n");
        console.log("nft bridge deployed to:", nftBridgeAddress);
    } else {
        console.log("#######################\n");
        console.log("nft bridge was already deployed to:", nftBridgeAddress);
    }

    fs.writeFileSync(pathOutputJson, JSON.stringify({...deployOutput, nftBridgeAddress}, null, 1));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
