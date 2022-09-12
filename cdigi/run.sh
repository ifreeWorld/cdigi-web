#!/bin/bash

set -e

# stop & rm
docker compose down
docker rmi $(docker images | grep "wangzilong8/cdigi" | awk '{print $3}') 2>/dev/null || echo "No cdigi images to remove."

# pull new image
docker pull wangzilong8/cdigi-web_client:latest
docker pull wangzilong8/cdigi-web_server:latest

# start
docker compose up -d --build
