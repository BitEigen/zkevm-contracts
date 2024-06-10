FROM khanhnb/rskj:dev

WORKDIR /var/lib/rsk


EXPOSE 8545
EXPOSE 8546

USER rsk

COPY --chown=rsk:rsk docker/rsk /var/lib/rsk/.rsk
COPY --chown=rsk:rsk docker/deploymentOutput /var/lib/rsk/deploymentOutput

ENTRYPOINT ["java"]

CMD ["-Dlogging.stdout=INFO", "-Dlogging=OFF", "-Dkeyvalue.datasource=rocksdb", "-Drpc.skipRemasc=true", "-Drpc.providers.web.cors=*", "-Drpc.providers.web.http.bind_address=0.0.0.0", "-Drpc.providers.web.http.port=8545", "-Drpc.providers.web.http.hosts.0=*", "-Drpc.providers.web.ws.bind_address=0.0.0.0", "-Drpc.providers.web.ws.enabled=true", "-Drpc.providers.web.ws.port=8546", "-cp", "rsk.jar", "co.rsk.Start", "--regtest"]
