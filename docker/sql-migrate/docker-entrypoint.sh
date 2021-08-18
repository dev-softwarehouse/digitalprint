#!/bin/bash

set -eo pipefail
shopt -s nullglob

for db in dp vprojekt
do
    echo "Starting migration for $db"
    sql-migrate up -env=$db
done
