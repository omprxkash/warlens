FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    WARLENS_MODEL_DIR=/app/model

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/app.py .
COPY model/ ./model/

# Run as a non-root user; the upload handler writes here so it needs to own it.
RUN useradd --create-home --uid 1001 warlens \
    && mkdir -p uploads \
    && chown -R warlens:warlens /app
USER warlens

EXPOSE 5000

# --preload loads the TF models in the master so workers share memory via fork copy-on-write.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "--preload", "app:app"]
