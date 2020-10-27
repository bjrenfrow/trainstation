FROM node:14.14

WORKDIR /app

ADD package.json .
ADD package-lock.json .

RUN npm i

CMD echo "ready"
