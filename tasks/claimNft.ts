import {task} from "hardhat/config";

import axios from "axios";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import deployOutput from "../deployment/v2/deploy_output.json";

async function claimNft(taskArgs: {tnx: string}, hre: HardhatRuntimeEnvironment) {
    const {nftBridgeAddress, polygonZkEVMBridgeAddress} = deployOutput;

    if (!nftBridgeAddress) throw new Error(`Missing nftBridgeAddress`);
    if (!polygonZkEVMBridgeAddress) throw new Error(`Missing polygonZkEVMBridgeAddress`);

    const client = axios.create({
        baseURL: process.env.BRIDGE_API_URL,
    });

    const bridgeContractZkeVM = await hre.ethers.getContractAt("PolygonZkEVMBridgeV2", polygonZkEVMBridgeAddress);

    const depositAxions = await client.get("/bridges/" + nftBridgeAddress, {params: {limit: 100, offset: 0}});
    const depositsArray = depositAxions.data.deposits;

    if (depositsArray.length === 0) {
        console.log("Not deposits yet!");
        return;
    }

    for (let i = 0; i < depositsArray.length; i++) {
        const currentDeposit = depositsArray[i];
        if (currentDeposit.ready_for_claim) {
            if (currentDeposit.claim_tx_hash != "") {
                console.log("already claimed: ", currentDeposit.claim_tx_hash);
                continue;
            }

            if (currentDeposit.tx_hash != taskArgs.tnx) continue;

            const proofAxios = await client.get("/merkle-proof", {
                params: {deposit_cnt: currentDeposit.deposit_cnt, net_id: currentDeposit.orig_net},
            });

            const {proof} = proofAxios.data;

            const claimTx = await bridgeContractZkeVM.claimMessage(
                proof.merkle_proof,
                proof.rollup_merkle_proof,
                currentDeposit.global_index,
                proof.main_exit_root,
                proof.rollup_exit_root,
                currentDeposit.orig_net,
                currentDeposit.orig_addr,
                currentDeposit.dest_net,
                currentDeposit.dest_addr,
                currentDeposit.amount,
                currentDeposit.metadata
            );
            console.log("claim message succesfully send: ", claimTx.hash);
            await claimTx.wait();
            console.log("claim message succesfully mined");
        } else {
            console.log("Not ready yet!");
        }
    }
}

task("claimNft").addParam("tnx", "origin tnx").setAction(claimNft);
