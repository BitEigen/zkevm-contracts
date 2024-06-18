FROM ethereum/client-go:v1.14.3

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 8545
EXPOSE 8546

COPY docker/gethData /
COPY docker/deploymentOutput /deploymentOutput

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["--rpc.allow-unprotected-txs", "--http", "--http.addr", "0.0.0.0", "--http.corsdomain", "*", "--http.vhosts", "*", "--ws", "--ws.origins", "*", "--ws.addr", "0.0.0.0", "--dev", "--dev.period", "1", "--datadir", "/geth_data"]
