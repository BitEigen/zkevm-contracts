import {task} from "hardhat/config";

import {HardhatRuntimeEnvironment} from "hardhat/types";
import {rollupAddress} from "../deployment/v2/create_rollup_output.json";

async function setTrustedSequencer(taskArgs: {url: string}, hre: HardhatRuntimeEnvironment) {
    if (!rollupAddress) throw new Error(`Missing rollupAddress`);

    const bridgeContractZkeVM = await hre.ethers.getContractAt("PolygonValidiumEtrog", rollupAddress);

    const setTrustedSequencerURLTx = await bridgeContractZkeVM.setTrustedSequencerURL(taskArgs.url);
    console.log("setTrustedSequencerURL succesfully send: ", setTrustedSequencerURLTx.hash);
    await setTrustedSequencerURLTx.wait();
    console.log("setTrustedSequencerURL succesfully mined");
}

task("setTrustedSequencer").addParam("url", "newTrustedSequencerURL").setAction(setTrustedSequencer);
