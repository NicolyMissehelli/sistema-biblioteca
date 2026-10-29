FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y nginx \
    && rm -rf /var/lib/apt/lists/*

COPY backendcombanco/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backendcombanco/app/ /app/app/
COPY backendcombanco/app/start.sh /app/start.sh
COPY frontend-biblioteca/ /tmp/frontend/

RUN mkdir -p /usr/share/nginx/html \
    && cp -r /tmp/frontend/. /usr/share/nginx/html/ \
    && chmod +x /app/start.sh

COPY frontend-biblioteca/nginx/default.conf /etc/nginx/sites-available/default

EXPOSE 80

CMD ["/app/start.sh"]