#!/bin/sh

[ -d ${STATIC_PATH} ] || mkdir -p ${STATIC_PATH}
envsubst '$STATIC_PATH,$STATIC_ADDITIONAL_CONFIG' < /etc/nginx/app.conf.tmp > /etc/nginx/conf.d/app.conf

[ $DEBUG ] && cat /etc/nginx/conf.d/app.conf

exec "$@"
