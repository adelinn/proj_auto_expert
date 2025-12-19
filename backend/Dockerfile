FROM node:24-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .

FROM node:24-slim
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 5000
CMD ["npm", "run", "start"]