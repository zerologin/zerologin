FROM node:16-alpine as BUILD_IMAGE
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    curl \
    pango-dev

RUN curl -sf https://gobinaries.com/tj/node-prune | sh

    
WORKDIR /usr/src/app

COPY . .
RUN yarn install
RUN yarn build
WORKDIR /usr/src/app/build
RUN yarn install --production
RUN node-prune

FROM node:16-alpine

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/build ./build

EXPOSE 3333

CMD [ "node", "./build/server.js" ]