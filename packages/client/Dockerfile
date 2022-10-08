# 之所以镜像非常小，不包含 node_modules，是因为builder是个中间过程，最终的是基于FROM nginx:alpine，中间过程builder里的node_modules都没有了
FROM node:14-alpine AS builder

ENV PORT=80

ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"

WORKDIR /code
COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
COPY vendor /code/vendor
COPY . /code
RUN yarn install --frozen-lockfile --registry=https://registry.npmmirror.com/

RUN yarn build

FROM nginx:alpine

# Copy config nginx
COPY --from=builder /code/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /code/dist .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]