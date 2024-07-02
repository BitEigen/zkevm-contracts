/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved */
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {PolygonZkEVMDeployer} from "../../typechain-types";

export async function deployPolygonZkEVMDeployer(
    deployerAddress: string,
    signer: HardhatEthersSigner
): Promise<[PolygonZkEVMDeployer, string]> {
    const PolgonZKEVMDeployerFactory = await ethers.getContractFactory("PolygonZkEVMDeployer", signer);

    const contract = await PolgonZKEVMDeployerFactory.deploy(signer.address);
    await contract.waitForDeployment();

    const zkEVMDeployerAddress = await contract.getAddress();

    const zkEVMDeployerContract = (await PolgonZKEVMDeployerFactory.attach(
        zkEVMDeployerAddress
    )) as PolygonZkEVMDeployer;
    expect(await zkEVMDeployerContract.owner()).to.be.equal(deployerAddress);

    return [zkEVMDeployerContract, ethers.ZeroAddress];
}

export async function create2Deployment(
    polgonZKEVMDeployerContract: PolygonZkEVMDeployer,
    salt: string,
    deployTransaction: string,
    dataCall: string | null,
    deployer: HardhatEthersSigner,
    hardcodedGasLimit: bigint | null
) {
    // Encode deploy transaction
    const hashInitCode = ethers.solidityPackedKeccak256(["bytes"], [deployTransaction]);

    // Precalculate create2 address
    const precalculatedAddressDeployed = ethers.getCreate2Address(
        polgonZKEVMDeployerContract.target as string,
        salt,
        hashInitCode
    );
    const amount = 0;

    if ((await deployer.provider.getCode(precalculatedAddressDeployed)) !== "0x") {
        return [precalculatedAddressDeployed, false];
    }

    if (dataCall) {
        // Deploy using create2 and call
        if (hardcodedGasLimit) {
            const populatedTransaction =
                await polgonZKEVMDeployerContract.deployDeterministicAndCall.populateTransaction(
                    amount,
                    salt,
                    deployTransaction,
                    dataCall
                );
            populatedTransaction.gasLimit = hardcodedGasLimit;
            await (await deployer.sendTransaction(populatedTransaction)).wait();
        } else {
            await (
                await polgonZKEVMDeployerContract.deployDeterministicAndCall(amount, salt, deployTransaction, dataCall)
            ).wait();
        }
    } else {
        // Deploy using create2
        if (hardcodedGasLimit) {
            const populatedTransaction = await polgonZKEVMDeployerContract.deployDeterministic.populateTransaction(
                amount,
                salt,
                deployTransaction
            );
            populatedTransaction.gasLimit = hardcodedGasLimit;
            await (await deployer.sendTransaction(populatedTransaction)).wait();
        } else {
            await (await polgonZKEVMDeployerContract.deployDeterministic(amount, salt, deployTransaction)).wait();
        }
    }
    return [precalculatedAddressDeployed, true];
}

export function getCreate2Address(
    polgonZKEVMDeployerContract: PolygonZkEVMDeployer,
    salt: string,
    deployTransaction: string
) {
    // Encode deploy transaction
    const hashInitCode = ethers.solidityPackedKeccak256(["bytes"], [deployTransaction]);

    // Precalculate create2 address
    return ethers.getCreate2Address(polgonZKEVMDeployerContract.target as string, salt, hashInitCode);
}
