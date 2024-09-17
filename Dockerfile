FROM node:22
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install && yarn build

COPY . .
EXPOSE 3000
CMD ["yarn", "start:prod"]