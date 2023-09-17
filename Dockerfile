FROM node:18

WORKDIR /app

ENV MODEL_URL=file:///app/model/model.json

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --ci
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

COPY ./src /app/src
COPY ./model /app/model

CMD node ./src/server.js
