# atsworks-web-app/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist/atsworks-web-app/browser /usr/share/nginx/html

# 👇 Copia tu nginx.conf personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80