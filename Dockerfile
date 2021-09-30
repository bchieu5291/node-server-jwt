FROM node:slim
WORKDIR /usr/src/app
ENV ACCESS_TOKEN_SECRET=mysecret REFESH_TOKEN_SECRET=mysecret2 MONGO_DB_USER=george MONGO_DB_PASSWORD=dev123 SMTP_USER=george.bui5291@gmail.com SMTP_PASSWORD=Hieubui123
COPY package.json .

RUN yarn install
COPY . .
EXPOSE 4000
CMD ["yarn", "server"] 