#!/bin/sh
set -e

cd /app

uvicorn app.main:app --host 0.0.0.0 --port 8000 &

exec nginx -g "daemon off;"