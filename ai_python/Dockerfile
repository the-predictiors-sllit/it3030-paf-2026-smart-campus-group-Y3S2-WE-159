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

EXPOSE 2024

CMD ["uv", "run", "langgraph", "dev", "--host", "0.0.0.0", "--port", "2024"]
# CMD ["uv", "run", "langgraph", "dev", "--port", "2024"]