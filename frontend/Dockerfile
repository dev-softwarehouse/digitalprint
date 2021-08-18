FROM node:erbium-buster-slim AS build_image

WORKDIR /app
COPY ./ /app


RUN apt-get update && apt-get -y install git curl bzip2
RUN npm install -g bower@1.8.0 grunt-cli@1.3.2 && \
    echo '{ "allow_root": true }' > /root/.bowerrc

RUN npm install

RUN grunt deploy-cloud --id='${companyId}' --apiUrl='${apiUrl}' --authUrl=$'{authUrl}' --staticUrl='${staticUrl}' --socketUrl='${socketUrl}' --domainID='${domainID}' --versionHash='${versionHash}' --robots='${robots}'

FROM nginx:stable

WORKDIR /app

ENV NGX_WORKERS 1
ENV NGX_SRVNAME _
ENV NGX_CONN 1024

COPY ./.docker_entrypoint /usr/bin/entrypoint.sh
COPY ./.docker_nginx.conf /etc/nginx/nginx.conf.tmp
COPY --from=build_image /app/dist/ /app/dist/

RUN apt-get update && apt-get -y install gettext net-tools procps\
    && chmod a+x /usr/bin/entrypoint.sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 80

ENTRYPOINT ["/usr/bin/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
