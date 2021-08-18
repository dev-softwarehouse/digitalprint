FROM node:10-alpine

ENV MONGODB_PORT 27017

COPY ./ /app
WORKDIR /app

RUN npm install

expose 2600

CMD ["node", "loginApp.js"]
