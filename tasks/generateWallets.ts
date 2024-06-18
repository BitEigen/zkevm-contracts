import fs from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

type KeyStore = {
  name: string,
  address: string,
  keystore: string;
}

/**
  * usage: npx hardhat generateWallets
  *
  */

async function generateWallets(_taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  if (!process.env.DEPLOYER_PRIVATE_KEY ||
    !process.env.SEQUENCER_PRIVATE_KEY ||
    !process.env.AGGREGATOR_PRIVATE_KEY) {
    throw new Error("Invalid private keys");
  }
  const pathOutput = path.join(__dirname, '../config/wallets.json');
  const wallets: KeyStore[] = [];

  const w1 = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  const w2 = new hre.ethers.Wallet(process.env.SEQUENCER_PRIVATE_KEY);
  const w3 = new hre.ethers.Wallet(process.env.AGGREGATOR_PRIVATE_KEY);
  const k1 = await w1.encrypt("testonly");
  const k2 = await w2.encrypt("testonly");
  const k3 = await w3.encrypt("testonly");

  wallets.push({
    name: "Deployment Address",
    address: w1.address,
    keystore: k1
  });

  wallets.push({
    name: "Trusted sequencer",
    address: w2.address,
    keystore: k2
  });

  wallets.push({
    name: "Trusted aggregator",
    address: w3.address,
    keystore: k3
  });

  wallets.push({
    name: "DAC member",
    address: w3.address,
    keystore: k3
  });

  wallets.push({
    name: "Claim tx manager",
    address: w2.address,
    keystore: k2
  });

  fs.writeFileSync(pathOutput, JSON.stringify(wallets, null, 1));
}

task('generateWallets', 'generate wallets')
  .setAction(generateWallets);
