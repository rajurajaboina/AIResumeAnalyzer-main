# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules/.cache ./node_modules/.cache

EXPOSE 3000

CMD ["npm", "start"]
