FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --loglevel verbose
RUN npm install -g serve

EXPOSE 3001 5000

COPY . .

RUN npm run build:frontend

CMD npm run start:server & serve -s build