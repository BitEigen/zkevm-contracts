/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npx hardhat setCommitteeTask --network <network> --numofsig 1 --urls "http://url1,http://url2" --addrs "0xAddr1,0xAddr2"
  npx hardhat setCommitteeTask --numofsig 1 --network rsk --urls "http://zkevm-data-availability:8444" --addrs "0x9AD546dF2fCe7C6E4B8a75ADA055Ffd5cDf5D70A"

 */
import { expect } from "chai";
import { task } from "hardhat/config";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { loadCreateRollupParams, loadDeployParams } from "./utils";

async function setCommitteeTask(
  taskArgs: { numofsig: string; urls: string; addrs: string },
  hre: HardhatRuntimeEnvironment
) {
  const deployOutput = await loadDeployParams(path.join(__dirname, "../deployment/v2/deploy_output.json"));
  const createRollupOutput = await loadCreateRollupParams(path.join(__dirname, "../deployment/v2/create_rollup_output.json"));

  const { ethers } = hre;
  const dataCommitteeContractAddress = createRollupOutput.polygonDataCommitteeAddress;

  if (!dataCommitteeContractAddress) {
    throw new Error(`Missing DataCommitteeContract: ${deployOutput}`);
  }

  const dacContract = await ethers.getContractAt("PolygonDataCommittee", dataCommitteeContractAddress);

  // const requiredAmountOfSignatures = taskArgs.requiredSignatures;
  const requiredAmountOfSignatures = parseInt(taskArgs.numofsig);
  const urls = taskArgs.urls.split(",");
  const addrs = taskArgs.addrs.split(",");
  expect(urls.length).to.be.equal(addrs.length);
  expect(requiredAmountOfSignatures).to.be.lte(urls.length);

  const numDaMembers = await dacContract.getAmountOfMembers();
  console.log("Current number of DA members: ", numDaMembers);

  const addrsBytes = ethers.concat(addrs);

  const tx = await dacContract.setupCommittee(requiredAmountOfSignatures, urls, addrsBytes);
  console.log("Transaction hash:", tx.hash);
  // Wait for receipt
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);
  // const actualAmountOfmembers = await dacContract.getAmountOfMembers();
  const newDaMember = await dacContract.members(0);
  console.log("DA member 0: ", newDaMember);
}

task("setCommitteeTask", "set DA committee")
  .addParam("numofsig", "required amount of signatures")
  .addParam("urls", "DA member urls")
  .addParam("addrs", "DA member addresses")
  .setAction(setCommitteeTask);
