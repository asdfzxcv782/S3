FROM node:8-alpine

COPY . /workspace
WORKDIR /workspace
RUN npm install

EXPOSE 9697

CMD npm start
