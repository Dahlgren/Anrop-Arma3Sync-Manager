FROM node:lts-slim AS build
WORKDIR /app/
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/
RUN npm run build

FROM node:lts-slim
WORKDIR /app/
RUN apt-get update && apt-get install -y zsync && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json /app/
COPY patches/ /app/patches/
RUN npm install --production --unsafe-perm
COPY . /app/
COPY --from=build /app/public/app.js /app/public/app.js
CMD node app.js
