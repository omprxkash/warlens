# Hugging Face Spaces (Docker SDK) build for the WarLens Flask backend.
# HF Spaces expects the app to listen on port 7860.

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    WARLENS_MODEL_DIR=/app/model \
    WARLENS_CORS_ORIGINS=* \
    PORT=7860

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/app.py .

# Model weights (.h5) live here — push them to the Space repo via git-lfs.
# COPY succeeds even if model/ is empty; Flask then starts in degraded mode
# and GET /health will populate load_errors with the reason.
COPY model/ ./model/

# HF Spaces runs as a non-root user with uid 1000 by default.
RUN useradd --create-home --uid 1000 spaceuser \
    && mkdir -p uploads \
    && chown -R spaceuser:spaceuser /app
USER spaceuser

EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--timeout", "300", "app:app"]
