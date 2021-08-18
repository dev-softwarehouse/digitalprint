FROM node:10-alpine

WORKDIR /app

RUN apk --update add gettext nginx && rm -rf /var/cache/apk/*

COPY ./.docker_entrypoint /usr/bin/entrypoint.sh
COPY ./.docker_nginx.conf.tmp /etc/nginx/nginx.conf.tmp
RUN chmod a+x /usr/bin/entrypoint.sh

ENV NGX_WORKERS 1
ENV NGX_SRVNAME _
ENV NGX_CONN 1024

COPY . .
RUN npm install --only=prod
RUN rm ./.docker*

EXPOSE 80

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
