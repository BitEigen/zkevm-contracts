/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npx hardhat setTrustedSequencerTask --network localhost
 */
import { task } from 'hardhat/config';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import path from 'path';
import { loadCreateRollupParams } from './utils';

async function setTrustedSequencerTask(taskArgs: { numofsig: string, urls: string, addrs: string }, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const createRollupOutput = await loadCreateRollupParams(path.join(__dirname, "../deployment/v2/create_rollup_output.json"));
  const createRollupParams = await loadCreateRollupParams(path.join(__dirname, "../deployment/v2/create_rollup_parameters.json"));

  const celestia = await ethers.getContractAt("Celestia", createRollupOutput.polygonDataCommitteeAddress);
  await celestia.setTrustedSequencer(createRollupParams.trustedSequencer)
}

task('setTrustedSequencerTask', 'set signer for verifying Message')
  .setAction(setTrustedSequencerTask);
