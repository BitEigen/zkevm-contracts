import fs from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import deployParams from "../docker/scripts/v2/deploy_parameters_docker.json";
import createRollupParams from "../docker/scripts/v2/create_rollup_parameters_docker.json";

/**
  * Usage: npx hardhat createDeployParamTaskDocker --chainid <chainid>
  *
  */

async function createDeployParamTaskDocker(taskArgs: { chainid: string }, hre: HardhatRuntimeEnvironment) {
  if (!process.env.SEQUENCER_PRIVATE_KEY || !process.env.AGGREGATOR_PRIVATE_KEY || !process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error('Missing private key');
  }

  const deployer = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  const sequencer = new hre.ethers.Wallet(process.env.SEQUENCER_PRIVATE_KEY);
  const aggregator = new hre.ethers.Wallet(process.env.AGGREGATOR_PRIVATE_KEY);

  deployParams.admin = deployer.address;
  deployParams.initialZkEVMDeployerOwner = deployer.address;
  deployParams.timelockAdminAddress = deployer.address;
  deployParams.trustedAggregator = aggregator.address;
  deployParams.emergencyCouncilAddress = deployer.address;
  deployParams.deployerPvtKey = deployer.privateKey;

  createRollupParams.trustedSequencer = sequencer.address;
  createRollupParams.deployerPvtKey = deployer.privateKey;
  createRollupParams.adminZkEVM = deployer.address;
  // validium contract
  createRollupParams.consensusContract = "PolygonValidiumEtrog"
  createRollupParams.forkID = 9;
  createRollupParams.chainID = parseInt(taskArgs.chainid);

  fs.writeFileSync(path.join(__dirname, '../docker/scripts/v2/deploy_parameters_docker.json'), JSON.stringify(deployParams, null, 1));
  fs.writeFileSync(path.join(__dirname, '../docker/scripts/v2/create_rollup_parameters_docker.json'), JSON.stringify(createRollupParams, null, 1));
}

task('createDeployParamTaskDocker', 'create deploy parameters for zkSync deployment')
  .addParam("chainid", "Chain id for L2 network")
  .setAction(createDeployParamTaskDocker);
