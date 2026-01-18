# Usar imagem oficial do Python slim (Django 6.0 requer Python 3.12+)
FROM python:3.12-slim

# Evitar que o Python gere arquivos .pyc e garantir output em tempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependências do sistema (incluindo Tesseract OCR para a IA)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . /app/

# Criar diretório para o banco de dados e garantir permissões
RUN mkdir -p /app/data && chmod -R 777 /app/data
# Ajustar o settings.py para usar /app/data/db.sqlite3 se necessário
# Mas por agora usaremos o local padrão e montaremos o volume

# Expor porta do Django
EXPOSE 8000

# Script de entrada para migrações e início do servidor
CMD python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000
