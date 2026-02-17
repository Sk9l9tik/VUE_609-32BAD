FROM node:alpine

ARG VUE_APP_RELEASE_VERSION=1

# делаем каталог 'app' текущим рабочим каталогом
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider
# копируем оба 'package.json' и 'package-lock.json' (если есть)
COPY package*.json ./
# RUN apk add git
# RUN apk add --update --no-cache curl jq py3-configobj py3-pip py3-setuptools python3 python3-dev
# # устанавливаем зависимости проекта
# RUN apk add --no-cache --virtual .gyp make g++ \
#     && npm install  --force \
#     && apk del .gyp



RUN npm install 
COPY . .
RUN npm run build 
EXPOSE 8800
# CMD ["npx", "serve", "dist", "-s", "-l", "8800"]
# CMD [ "npx", "http-server", "dist", "-p", "8800"]
# CMD [ "npm", "run", "dev", "--", "--port", "8800"]
