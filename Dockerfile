# Базовый образ Node
FROM node:20-slim

# Рабочая директория
WORKDIR /app

# ENV для безопасной сборки sharp и ограничения памяти Node
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=true
ENV NODE_OPTIONS="--max-old-space-size=512"

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости, включая пакеты для сборки sharp
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    curl \
  && npm ci --omit=dev \
  && apt-get remove -y build-essential python3 curl \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Копируем остальной проект (static не копируем, указан в .dockerignore)
COPY . .

# Экспонируем порт
EXPOSE 30030

