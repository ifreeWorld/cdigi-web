FROM node:14-alpine AS builder

ENV PORT=80

WORKDIR /code
COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
RUN yarn install --frozen-lockfile --registry=https://registry.npmmirror.com/
COPY . /code

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