#!/bin/sh

grunt deploy-ftp --id=35
cp -R /app/.tmp/35/* /app/.default
