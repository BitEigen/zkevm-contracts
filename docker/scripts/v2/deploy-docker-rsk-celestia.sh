#!/bin/bash
sudo rm -rf docker/rsk
sudo rm -rf docker/deploymentOutput
mkdir docker/deploymentOutput
mkdir docker/rsk

# npx hardhat generateWallets

docker-compose -f docker/docker-compose-rsk.yml up -d rsk
sleep 5

# fund accounts and setup deploy params
node docker/scripts/fund-accounts-rsk.js
npx hardhat createDeployParamTask --chainid 1011

npm run deploy:testnet:v2:localhost
cp deployment/v2/deploy_output.json docker/deploymentOutput/
cp deployment/v2/genesis.json docker/deploymentOutput/
cp deployment/v2/create_rollup_output.json docker/deploymentOutput/

# setup trusted sequencer
npx hardhat setTrustedSequencerTask --network localhost

docker-compose -f docker/docker-compose-rsk.yml down --remove-orphans
docker build -t biteigen/rsk-zkevm-contracts:celestia -f docker/rsk.Dockerfile .
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/rsk
sudo chmod -R go+rxw docker/deploymentOutput

# update config
npx hardhat updateConfigTask --network localhost --rpc http://zkevm-mock-l1-network:8545 --wsrpc ws://zkevm-mock-l1-network:8546 --chainid 33
