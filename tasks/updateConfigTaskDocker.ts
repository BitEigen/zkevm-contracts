/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
*Usage: npx hardhat updateConfigTask --network <network> --rpc <rpc> --wsrpc <wsrpc>
npx hardhat updateConfigTask --network rskLocal --rpc http://l1 --wsrpc ws://l1

 */
import fs from 'fs';
import { task } from 'hardhat/config';
import path from 'path';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import wallets from '../config/wallets.json';
import createRollupOutput from '../docker/deploymentOutput/create_rollup_output.json';

import deployOutput from '../docker/deploymentOutput/deploy_output.json';
import genesisOutput from '../docker/deploymentOutput/genesis.json';
import createRollupParams from '../docker/scripts/v2/create_rollup_parameters_docker.json';

const bridgeConfigTomlPath = path.join(__dirname, '../config/bridge/config.toml');
const dacConfigTomlPath = path.join(__dirname, '../config/dac/config.toml');
const nodeConfigTomlPath = path.join(__dirname, '../config/node/config.toml');

async function updateConfigTaskDocker(taskArgs: { rpc: string, wsrpc: string }, hre: HardhatRuntimeEnvironment) {
  if (!hre.network.config.chainId){
    throw new Error("Please set chainId in network config");
  }
  setKeystore();
  updateGenesisJson(hre);
  updateNodeConfigToml(taskArgs.rpc, hre.network.config.chainId, nodeConfigTomlPath);
  updateDACConfigToml(taskArgs.rpc, taskArgs.wsrpc, dacConfigTomlPath);
  updateBridgeConfigToml(taskArgs.rpc, bridgeConfigTomlPath);
}

function setKeystore() {
  for (const wallet of wallets) {
    writeFileBasedOnSection(wallet.name, wallet.keystore);
  }
}

function writeFileBasedOnSection(section: string, keystoreData: string) {
  let filename;
  switch (section) {
    case 'Trusted sequencer':
      filename = path.join(__dirname, '../config/node/sequencer.keystore');
      break;
    case 'Trusted aggregator':
      filename = path.join(__dirname, '../config/node/aggregator.keystore');
      break;
    case 'DAC member':
      filename = path.join(__dirname, '../config/dac/dac-member.keystore');
      break;
    case 'Claim tx manager':
      filename = path.join(__dirname, '../config/bridge/claimtx.keystore');
      break;
    // Add more cases as needed
    default:
      return;
  }
  fs.writeFileSync(filename, keystoreData);
  console.log(`Written keystore to ${filename}`);
}

function updateGenesisJson(hre: HardhatRuntimeEnvironment) {
  const pathOutput = path.join(__dirname, '../config/node/genesis.config.json');

  if (!hre.network || hre.network.name === 'hardhat') {
    throw new Error('Missing network');
  }

  const l1Config = {
    chainId: hre.network.config.chainId,
    polygonZkEVMAddress: createRollupOutput.rollupAddress,
    polygonRollupManagerAddress: deployOutput.polygonRollupManagerAddress,
    polTokenAddress: deployOutput.polTokenAddress,
    polygonZkEVMGlobalExitRootAddress: deployOutput.polygonZkEVMGlobalExitRootAddress
  }

  // Reference: https://github.com/0xPolygon/cdk-validium-node/blob/v0.6.4%2Bcdk/docs/config-file/custom_network-config-doc.md
  const genesisConfig = {
    root: genesisOutput.root,
    genesis: genesisOutput.genesis,
    l1Config: l1Config,
    rollupManagerCreationBlockNumber: deployOutput.deploymentRollupManagerBlockNumber,
    rollupCreationBlockNumber: createRollupOutput.createRollupBlockNumber,
  }

  fs.writeFileSync(pathOutput, JSON.stringify(genesisConfig, null, 1));
}

function updateNodeConfigToml(l1RpcUrl: string, chainId: number, configTomlPath: string) {
  let configContent = fs.readFileSync(configTomlPath, 'utf8');

  configContent = configContent.replace(/(L2Coinbase\s*=\s*)".*"/, `$1"${createRollupParams.trustedSequencer}"`);
  configContent = configContent.replace(/(SenderAddress\s*=\s*)".*"/, `$1"${deployOutput.trustedAggregator}"`);
  configContent = configContent.replace(/(URL\s*=\s*)".*"/, `$1"${l1RpcUrl}"`);
  configContent = configContent.replace(/(ChainID\s*=\s*).*/, `$1${chainId}`);
  // configContent = configContent.replace(/(\s*ApiKey\s*=\s*)".*"/, `$1"${process.env.ETHERSCAN_API_KEY}"`);

  // configContent = replaceKeystorePassword(configContent);

  fs.writeFileSync(configTomlPath, configContent, 'utf8');
}

function updateDACConfigToml(l1RpcUrl: string, l1WsRpcUrl: string, configTomlPath: string) {
  let configContent = fs.readFileSync(configTomlPath, 'utf8');

  configContent = configContent.replace(/(PolygonValidiumAddress\s*=\s*)".*"/, `$1"${createRollupOutput.rollupAddress}"`);
  configContent = configContent.replace(/(DataCommitteeAddress\s*=\s*)".*"/, `$1"${createRollupOutput.polygonDataCommitteeAddress}"`);
  configContent = configContent.replace(/(RpcURL\s*=\s*)".*"/, `$1"${l1RpcUrl}"`);
  configContent = configContent.replace(/(WsURL\s*=\s*)".*"/, `$1"${l1WsRpcUrl}"`);
  configContent = configContent.replace(/(GenesisBlock\s*=\s*)".*"/, `$1"${deployOutput.deploymentRollupManagerBlockNumber}"`);

  fs.writeFileSync(configTomlPath, configContent, 'utf8');
}

function updateBridgeConfigToml(l1RpcUrl: string, configTomlPath: string) {
  let configContent = fs.readFileSync(configTomlPath, 'utf8');

  configContent = configContent.replace(/(GenBlockNumber\s*=\s*)\d+/, `$1${deployOutput.deploymentRollupManagerBlockNumber}`);
  configContent = configContent.replace(/(PolygonBridgeAddress\s*=\s*)".*"/, `$1"${deployOutput.polygonZkEVMBridgeAddress}"`);
  configContent = configContent.replace(/(PolygonZkEVMGlobalExitRootAddress\s*=\s*)".*"/, `$1"${deployOutput.polygonZkEVMGlobalExitRootAddress}"`);
  configContent = configContent.replace(/(PolygonRollupManagerAddress\s*=\s*)".*"/, `$1"${deployOutput.polygonRollupManagerAddress}"`);
  configContent = configContent.replace(/(PolygonZkEvmAddress\s*=\s*)".*"/, `$1"${createRollupOutput.rollupAddress}"`);
  configContent = configContent.replace(/(L1URL\s*=\s*)".*"/, `$1"${l1RpcUrl}"`);

  // Find the address for "PolygonZkEVMBridge proxy" in genesis.config.json
  const bridgeProxy = genesisOutput.genesis.find(item => item.contractName === "PolygonZkEVMBridge proxy");
  if (bridgeProxy) {
    // Update L2PolygonBridgeAddresses
    configContent = configContent.replace(/(L2PolygonBridgeAddresses\s*=\s*)\[".*"\]/, `$1["${bridgeProxy.address}"]`);
  }

  fs.writeFileSync(configTomlPath, configContent, 'utf8');
}

task('updateConfigTaskDocker', 'update config for network')
  .addParam<string>('rpc', 'L1 RPC URL')
  .addParam<string>('wsrpc', 'L1 WS RPC URL')
  .setAction(updateConfigTaskDocker);
