#!/bin/bash
sudo rm -rf docker/rsk
sudo rm -rf docker/deploymentOutput
mkdir docker/deploymentOutput
mkdir docker/rsk

npx hardhat generateWallets

docker-compose -f docker/docker-compose-rsk.yml up -d rsk
sleep 5

# fund accounts and setup deploy params
node docker/scripts/fund-accounts-rsk.js
npx hardhat createDeployParamTask --chainid 1011

npm run deploy:testnet:v2:rskLocal
cp deployment/v2/deploy_output.json docker/deploymentOutput/
cp deployment/v2/genesis.json docker/deploymentOutput/
cp deployment/v2/create_rollup_output.json docker/deploymentOutput/

# setup committee with default address
npx hardhat setCommitteeTask --numofsig 1 --network rskLocal --urls "http://zkevm-data-availability:8444" --addrs "0x8af3d8b398d43bed74b717ae3eaf11f4c44bb80e"

docker-compose -f docker/docker-compose-rsk.yml down --remove-orphans
docker build -t biteigen/rsk-zkevm-contracts:dac -f docker/rsk.Dockerfile .
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/rsk
sudo chmod -R go+rxw docker/deploymentOutput

# update config
npx hardhat updateConfigTask --network rskLocal --rpc http://zkevm-mock-l1-network:8545 --wsrpc ws://zkevm-mock-l1-network:8546
