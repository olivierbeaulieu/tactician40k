FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --loglevel verbose

EXPOSE 3000 3001 5000

COPY . .

RUN npm run build
RUN npm install -g serve

CMD npm run server & serve -s build