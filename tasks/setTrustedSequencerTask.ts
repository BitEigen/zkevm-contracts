/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npx hardhat setTrustedSequencerTask --network localhost
 */
import { expect } from 'chai';
import { task } from 'hardhat/config';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import createRollupOutput from '../deployment/v2/create_rollup_output.json';
import createRollupParams from '../deployment/v2/create_rollup_parameters.json';

async function setTrustedSequencerTask(taskArgs: { numofsig: string, urls: string, addrs: string }, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;

  const celestia = await ethers.getContractAt("Celestia", createRollupOutput.polygonDataCommitteeAddress);
  await celestia.setTrustedSequencer(createRollupParams.trustedSequencer)
}

task('setTrustedSequencerTask', 'set signer for verify message')
  .setAction(setTrustedSequencerTask);
