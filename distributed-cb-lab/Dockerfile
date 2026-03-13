FROM node:alpine
WORKDIR /app
COPY . /app/
RUN npm install
EXPOSE 3001 4001
CMD ["sh", "-c", "node post-service.js & node feed-service.js"]