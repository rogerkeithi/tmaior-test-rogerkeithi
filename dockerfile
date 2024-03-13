FROM node:current-alpine3.19

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY dist/ .

EXPOSE 5000
CMD ["node","./server-prod.js"]