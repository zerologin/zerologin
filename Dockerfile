FROM node:16-alpine as BUILD_IMAGE
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev

    
WORKDIR /usr/src/app

COPY . .
RUN yarn install
RUN yarn build

FROM node:16-alpine

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/build ./build
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 3333

CMD [ "node", "./build/server.js" ]