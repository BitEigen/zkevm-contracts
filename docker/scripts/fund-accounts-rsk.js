/* eslint-disable no-await-in-loop */

const ethers = require('ethers');
require('dotenv').config();
const wallets = require('../../config/wallets.json')

async function main() {
    const currentProvider = ethers.getDefaultProvider('http://localhost:8545');
    const signerNode = await currentProvider.getSigner();

    console.log(`Fund from ${await signerNode.getAddress()}`)
    for (const wallet of wallets) {
        console.log(`Fund account ${wallet.name} at ${wallet.address}`);
        const params = [{
            from: await signerNode.getAddress(),
            to: wallet.address,
            value: '0x3635C9ADC5DEA00000',
        }];
        const tx = await currentProvider.send('eth_sendTransaction', params);
        await currentProvider.waitForTransaction(tx);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
