# 1. Build phase
FROM node:18 as builder

WORKDIR /app
COPY package*.json ./
COPY . .

# Ensure we set the publicpath correctly for GitHub Pages (and Docker)
ENV EXPO_PUBLIC_PATH=/dartboard/

RUN npm ci
RUN npx expo export --platform web

# 2. Serve phase
FROM node:18-slim as runner

WORKDIR /app
RUN npm install -g serve

# Copy only the build output (for Expo SDK 49+: "dist")
COPY --from=builder /app/dist ./dist

# Add a SPA 404 fallback for refreshes/paths
RUN cp ./dist/index.html ./dist/404.html

EXPOSE 5000

CMD ["serve", "-s", "dist", "--single", "--listen", "5000"]