FROM node:16

WORKDIR /usr/src/app

COPY . .

RUN node ./createKeypair.js
RUN yarn install --production

CMD ["yarn", "start"]

EXPOSE 5000