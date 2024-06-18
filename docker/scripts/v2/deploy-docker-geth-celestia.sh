#!/bin/bash
sudo rm -rf docker/gethData
sudo rm -rf docker/deploymentOutput
mkdir docker/deploymentOutput
mkdir docker/gethData

npx hardhat generateWallets

DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml up -d geth
sleep 5

# fund accounts and setup deploy params
node docker/scripts/fund-accounts-rsk.js
npx hardhat createDeployParamTask --chainid 1011 --daproto Celestia

npm run deploy:testnet:v2:localhost
cp deployment/v2/deploy_output.json docker/deploymentOutput/
cp deployment/v2/genesis.json docker/deploymentOutput/
cp deployment/v2/create_rollup_output.json docker/deploymentOutput/

# setup trusted sequencer
npx hardhat setTrustedSequencerTask --network localhost

# update config
npx hardhat updateConfigTask --network localhost --rpc http://zkevm-mock-l1-network:8545 --wsrpc ws://zkevm-mock-l1-network:8546

DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml down --remove-orphans
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/gethData
sudo chmod -R go+rxw docker/deploymentOutput
docker build -t biteigen/geth-zkevm-contracts:celestia -f docker/Dockerfile .

