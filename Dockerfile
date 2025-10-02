# Используем официальный образ Python 3.12 (стабильный и совместимый)
FROM python:3.12-slim

# Устанавливаем зависимости ОС для psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Создаём папку для БД (на случай локального запуска, на Render не используется)
RUN mkdir -p instance

# Экспонируем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["python", "app.py"]
