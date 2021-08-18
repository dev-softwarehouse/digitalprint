FROM romeoz/docker-nginx-php:7.2 as build

WORKDIR /var/www/app/

COPY ./ /var/www/app/

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install --allow-downgrades --allow-remove-essential --allow-change-held-packages -y -o Dpkg::Options::="--force-confold" libxml2-dev gettext-base php7.2-mbstring php7.2-xml php7.2-imagick php7.2-bcmath php7.2-soap php7.2-mongo composer unzip \
    && composer install \
    && composer dumpautoload -o \
    && composer clear-cache


FROM romeoz/docker-nginx-php:7.2 as final

ENV PHP_MAX_CHILDREN 5
ENV PHP_START_SERVERS 2
ENV PHP_MIN_SPARE 1
ENV PHP_MAX_SPARE 3
ENV PHP_ERROR_REPORTING "E_ALL"
ENV NGINX_GZIP on
ENV NGINX_REAL_IP 172.18.0.0/16

WORKDIR /var/www/app/

COPY ./.docker_entrypoint /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh
COPY ./.docker_nginx /etc/nginx/app.conf.tmp
COPY ./.docker_fpm /etc/php/7.2/fpm/pool.d/www.conf.tmp
COPY --from=build /var/www/app/ /var/www/app/

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install --allow-downgrades --allow-remove-essential --allow-change-held-packages -y -o Dpkg::Options::="--force-confold" php7.2-mbstring php7.2-xml php7.2-imagick libxml2 php7.2-bcmath php7.2-soap gettext-base php7.2-mongo \
    && rm -rf /var/lib/apt/lists/* \
    && rm ./.docker* \
    && chmod a+x /usr/bin/entrypoint.sh

COPY ./.docker_imagick-policy /etc/ImageMagick-6/policy.xml


EXPOSE 80 443

ENTRYPOINT ["/usr/bin/entrypoint.sh"]

CMD ["/usr/bin/supervisord"]
