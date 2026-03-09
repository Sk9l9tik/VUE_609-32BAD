FROM node:22-alpine

WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider

# Устанавливаем зависимости
COPY package.json ./
# RUN apk add git
# RUN apk add --update --no-cache curl jq py3-configobj py3-pip py3-setuptools python3 python3-dev
# устанавливаем зависимости проекта
# RUN apk add --no-cache --virtual .gyp make g++ \
#     && npm install  --force \
#     && apk del .gyp
    
RUN npm install --force 

# Открываем порт для Vite/Vue CLI dev server
EXPOSE 8080
EXPOSE 8800

CMD ["npm", "run", "dev", "--", "--port", "8800"]
