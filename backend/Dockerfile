FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
COPY .env.example .env
RUN mkdir -p database uploads
EXPOSE 5000
CMD ["node", "src/index.js"]
