FROM node:22-alpine3.19
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .
EXPOSE 3000
CMD ["yarn", "start:dev"]