FROM nginx:stable-alpine

ENV STATIC_PATH /var/www/app

COPY ./docker/static/app.conf /etc/nginx/app.conf.tmp
COPY ./docker/static/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod a+x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
