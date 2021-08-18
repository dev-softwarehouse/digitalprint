FROM node:12-alpine

WORKDIR /app

RUN apk --update add git curl nginx gettext && rm -rf /var/cache/apk/*

ENV NGX_WORKERS 1
ENV NGX_SRVNAME _
ENV NGX_CONN 1024

COPY ./.docker_entrypoint /usr/bin/entrypoint.sh
COPY ./.docker_nginx.conf /etc/nginx/nginx.conf.tmp

COPY ./ /app

RUN rm ./.docker*
RUN npm install

RUN chmod a+x /usr/bin/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/usr/bin/entrypoint.sh"]

CMD ["npm", "run", "start"]