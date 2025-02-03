FROM node:22-alpine

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8

WORKDIR /app

RUN apk add --no-cache npm

COPY package*.json .
RUN npm ci --omit=optional

COPY . .

EXPOSE 3000

VOLUME /app/storage

ENTRYPOINT ["node", "app.js"]
