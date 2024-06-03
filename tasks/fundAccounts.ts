import fs from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import wallets from "../config/wallets.json";

/**
  * usage: npx hardhat fundWallets
  *
  */


async function fundAccounts(_taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  const provider = hre.ethers.provider;
  // one default account of rsk
  const signerAddress = "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826";

  console.log(`Fundings from ${signerAddress}`)
  for (const wallet of wallets) {
    console.log(`Funding ${wallet.name} at ${wallet.address} ...`);
    const params = [{
      from: signerAddress,
      to: wallet.address,
      value: '0x3635C9ADC5DEA00000',
    }];
    await provider.send('eth_sendTransaction', params);
  }
}

task('fundAccounts', 'fund accounts')
  .setAction(fundAccounts);
