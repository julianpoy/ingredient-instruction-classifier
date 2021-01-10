FROM node:14

WORKDIR /app

ENV MODEL_URL=file:///app/model/model.json

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY ./src /app/src
COPY ./model /app/model

RUN node ./src/server.js
