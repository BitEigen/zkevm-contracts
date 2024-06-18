import fs from "fs";

const loadJson = async (filePath: string): Promise<string> => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data
  } catch (err) {
    console.error(err);
  }
  return "{}";
}

export interface ICreateRollupParams {
  realVerifier: boolean;
  trustedSequencerURL: string;
  networkName: string;
  description: string;
  trustedSequencer: string;
  chainID: number;
  adminZkEVM: string;
  forkID: number;
  consensusContract: string;
  dataAvailabilityProtocol: string;
  gasTokenAddress: string;
  deployerPvtKey: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  polygonDataCommitteeAddress: string;
  rollupAddress: string;
  createRollupBlockNumber: string;
  multiplierGas: string;
}

export interface IDeployParams {
  test: boolean;
  timelockAdminAddress: string;
  minDelayTimelock: number;
  salt: string;
  initialZkEVMDeployerOwner: string;
  admin: string;
  trustedAggregator: string;
  trustedAggregatorTimeout: number;
  pendingStateTimeout: number;
  emergencyCouncilAddress: string;
  polTokenAddress: string;
  zkEVMDeployerAddress: string;
  deployerPvtKey: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  multiplierGas: string;
  polygonRollupManagerAddress: string;
  polygonZkEVMGlobalExitRootAddress: string;
  deploymentRollupManagerBlockNumber: string;
  createRollupBlockNumber: string;
  polygonZkEVMBridgeAddress: string;
  nftBridgeAddress: string;
}

export interface INetwork {
  root: string;
  genesis: Genesis[];
}

export interface Genesis {
  contractName?: string;
  balance: string;
  nonce: string;
  address: string;
  bytecode?: string;
  storage?: Object;
  accountName?: string;
}

export const loadDeployParams = async (path: string): Promise<IDeployParams> => {
  const json = await loadJson(path);
  return JSON.parse(json) as IDeployParams;
}

export const loadCreateRollupParams = async (path: string): Promise<ICreateRollupParams> => {
  const json = await loadJson(path);
  return JSON.parse(json) as ICreateRollupParams;
}

export const loadGenesis = async (path: string): Promise<INetwork> => {
  const json = await loadJson(path);
  return JSON.parse(json) as INetwork;
}
