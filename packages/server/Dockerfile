FROM node:14-alpine AS builder

ENV PORT=30000
RUN apk add tzdata

WORKDIR /code

COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
COPY vendor /code/vendor
COPY . /code

RUN yarn install --production --frozen-lockfile --registry=https://registry.npmmirror.com/
RUN yarn build
CMD yarn runsql && node dist/main.js
