FROM node:carbon-buster-slim AS build_image

WORKDIR /app

ENV NODE_ENV development

COPY . .
RUN npm install
RUN npm install -g gulp
RUN gulp build --companyID='${companyID}' --port='${port}' --domain='${domain}' --frameworkUrl='${frameworkUrl}' --authUrl='${authUrl}' --staticUrl='${staticUrl}'

FROM nginx:stable

ENV NGX_WORKERS 1
ENV NGX_SRVNAME _
ENV NGX_CONN 1024

COPY ./.docker_entrypoint /usr/bin/entrypoint.sh
COPY ./.docker_nginx.conf.tmp /etc/nginx/nginx.conf.tmp
COPY --from=build_image /app/app/ /app/app/

RUN apt-get update && apt-get -y install gettext \
    && chmod a+x /usr/bin/entrypoint.sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm ./.docker*

EXPOSE 80

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
