FROM python:3.13-slim-trixie

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git bash \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project

COPY . .

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync

CMD ["uv", "run", "fastapi", "dev", "app/main.py", "--port", "8290", "--host", "0.0.0.0"]