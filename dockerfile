FROM node:current-alpine3.19

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build

EXPOSE 5000
CMD ["node","dist/server-prod.js"]