FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
RUN chown -R node:node /app
USER node

EXPOSE 8082

CMD ["npm", "start"]
