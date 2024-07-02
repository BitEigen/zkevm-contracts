# Deploy docs

## Clone project
```sh
git clone -b feat/rsk git@github.com:BitEigen/zkEVM-contracts-dev.git
cd zkEVM-contracts
cp .env.example .env
npm i
```
Note: update .env

## Deploy contracts
1. Tạo ví
```sh
npx hardhat generateWallets
```
Faucet cho ví: https://faucet.rootstock.io/ 

2. Setup rsk node

    2.1 Setup testnet
    ```sh
    git clone https://github.com/BitEigen/rskj
    cd rskj
    ./configure
    ./gradlew :rskj-core:run --args="--testnet"
    ```

    2.2 Setup local node để test smart contract (optional)

    https://dev.rootstock.io/kb/geth-attach-local-node/

3. Tạo deploy params
```sh
npx hardhat createDeployParamTask --chainid 1011
```
Trong đó chainid sẽ là chainId của chain sắp dựng

4. Deploy contracts
```sh
npm run deploy:testnet:v2:rsk
```
Note:

* Có thể bỏ qua bước 2_deployPolygonZKEVMDeployer nếu như đã deploy Pol Token và zkEVMDeployerContract
* Trong quá trình deploy có thể gặp lỗi:
    ```sh
    zkEVMDeployerContract:  0xD1d7A8B2C71A55B33c6556b56d17B71FAA7f0C59
    Error: zkEVM deployer contract is not deployed
    ```

    Lỗi này do network lag => đợi cho contract hiển thị trên explorer rồi chạy tiếp bước `3_deployContracts` và `4_createRollup` như trong script.


5. Verify contracts (optional vì hầu hết contract đã được verify trên rootstock testnet rồi)
```sh
npm run verify:v2:rsk
```

6. Update config
```sh
npx hardhat updateConfigTask --network rsk --rpc http://192.168.1.71:4444 --wsrpc ws://192.168.1.71:4446
```

7. Setup Polygon Data Committee

```sh
npx hardhat setCommitteeTask --network <network> --numofsig 1 --urls "http://url1,http://url2" --addrs "0xAddr1,0xAddr"
# Eg: npx hardhat setCommitteeTask --numofsig 1 --network rsk --urls "https://data-availability-1.biteigen.xyz" --addrs "0x8af3d8b398d43bed74b717ae3eaf11f4c44bb80e"
```

## Run nodes
1. Dựng nodes bằng docker
```sh
git clone https://github.com/BitEigen/zkValidium-quickstart
```
Copy folder config từ bên deploy smart contract ghi đè sang folder config của bên zkValidium-quickstart 

```sh
make run
```

Custom lại docker-compose.yml cho phù hợp nhu cầu!

2. Dựng nodes từ source code
    Tài liệu tham khảo thêm: 

    https://github.com/0xPolygon/polygon-docs/blob/b9d8175150d24046b050cb8044cf4f4b26854176/docs/cdk/get-started/deploy-validium/node/run-node-services.md

    2.1 Dựng node zk-prover

    Do zk-prover ở môi trường test chỉ là mock nên có thể tham khảo luôn cách dựng bên docker

    2.2 Dựng nodes
    
    Build

    ```sh
    git clone https://github.com/0xPolygon/cdk-validium-node.git 
    git checkout tags/v0.6.4+cdk.2

    git clone https://github.com/0xPolygon/cdk-data-availability.git
    git checkout tags/v0.07


    git clone https://github.com/0xPolygonHermez/zkevm-bridge-service.git
    git checkout tags/v0.4.2
    ```

    Dựng các service nodes
    Note: các file network + config ở dưới đây có trong folder config ở bên smart contract

    ```sh
    cd cdk-validium-node
    ./dist/zkevm-node run --network custom --custom-network-file /tmp/cdk/genesis.json --cfg /tmp/cdk/node-config.toml \
    	--components sequencer \
    	--components sequence-sender \
    	--components aggregator \
    	--components rpc --http.api eth,net,debug,zkevm,txpool,web3 \
    	--components synchronizer \
    	--components eth-tx-manager \
    	--components l2gaspricer
    ```
    Approve pol token:
    ```sh
    cd cdk-validium-node
    ./dist/zkevm-node approve --network custom \
    	--custom-network-file /tmp/cdk/genesis.json \
    	--cfg /tmp/cdk/node-config.toml \
    	--amount 1000000000000000000000000000 \
    	--password "testonly" --yes --key-store-path /tmp/cdk/account.key
    ```

    DAC:
    ```sh
    cd cdk-data-availability
    ./dist/cdk-data-availability run --cfg /tmp/cdk/dac-config.toml
    ```

    Bridge service:
    ```sh
    cd zkevm-bridge-service
    ./dist/zkevm-bridge run --cfg /tmp/cdk/bridge-config.toml
    ```

