FROM node:23-alpine3.20

RUN addgroup -g 1001 -S nodejs && \
    adduser -S it-pub -u 1001 -G nodejs

WORKDIR /it_pub

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p data && chown -R it-pub:nodejs data

USER it-pub

CMD ["npm", "start"]