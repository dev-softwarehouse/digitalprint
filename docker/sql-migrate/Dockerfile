FROM golang:alpine

#RUN \
#    apt-get update && \
#    apt-get install -y mysql-client bash && \

RUN apk --update add mysql-client git g++ gcc bash && \
    rm -rf /var/cache/apk/* && \
    go get github.com/rubenv/sql-migrate/... && \
    mkdir -p /sql /sql-migrate

WORKDIR /app

COPY ./docker/sql-migrate/migrations /app
ADD ./docker/sql-migrate/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

#CMD ["/bin/bash"]
