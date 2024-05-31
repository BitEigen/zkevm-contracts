# #!/bin/bash
# rm -rf docker/gethData/geth_data
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml up -d geth
# sleep 5
# node docker/scripts/fund-accounts.js
# cp docker/scripts/v2/deploy_parameters_docker.json deployment/v2/deploy_parameters.json
# cp docker/scripts/v2/create_rollup_parameters_docker.json deployment/v2/create_rollup_parameters.json
# npm run deploy:testnet:v2:localhost
# mkdir docker/deploymentOutput
# mv deployment/v2/deploy_output.json docker/deploymentOutput
# mv deployment/v2/genesis.json docker/deploymentOutput
# mv deployment/v2/create_rollup_output.json docker/deploymentOutput
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml down
# docker build -t hermeznetwork/geth-zkevm-contracts -f docker/Dockerfile .
# # Let it readable for the multiplatform build coming later!
# sudo chmod -R go+rxw docker/gethData


#!/bin/bash
sudo rm -rf docker/gethData
sudo rm -rf docker/deploymentOutput
mkdir docker/deploymentOutput
mkdir docker/gethData

# npx hardhat generateWallets

DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml up -d geth
sleep 5

# fund accounts and setup deploy params
node docker/scripts/fund-accounts-rsk.js
npx hardhat createDeployParamTask --chainid 1011

npm run deploy:testnet:v2:localhost
cp deployment/v2/deploy_output.json docker/deploymentOutput/
cp deployment/v2/genesis.json docker/deploymentOutput/
cp deployment/v2/create_rollup_output.json docker/deploymentOutput/

# setup committee with default address
npx hardhat setCommitteeTask --numofsig 1 --network localhost --urls "http://zkevm-data-availability:8444" --addrs "0x8af3d8b398d43bed74b717ae3eaf11f4c44bb80e"

DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml down --remove-orphans
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/gethData
sudo chmod -R go+rxw docker/deploymentOutput
docker build -t biteigen/geth-zkevm-contracts:dac -f docker/Dockerfile .

# update config
npx hardhat updateConfigTask --network localhost --rpc http://zkevm-mock-l1-network:8545 --wsrpc ws://zkevm-mock-l1-network:8546
