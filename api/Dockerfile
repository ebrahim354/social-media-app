FROM node:slim

WORKDIR /usr/src/app

COPY . .

RUN yarn install --production

CMD ["yarn", "start"]

EXPOSE 5000