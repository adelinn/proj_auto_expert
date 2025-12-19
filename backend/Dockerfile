FROM node:24-alpine AS build

RUN apk add --update python3 py3-pip curl bash
RUN curl -fsSL https://bun.sh/install | bash

ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .

FROM node:24-slim
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 5000
CMD ["npm", "run", "start"]