FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv from official Astral binary image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation and unbuffered stdout/stderr
ENV UV_COMPILE_BYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy dependency definition files
COPY pyproject.toml uv.lock ./

# Install dependencies into /app/.venv
RUN uv sync --frozen --no-install-project

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy backend source code
COPY . .

# Ensure start script has executable permissions
RUN chmod +x start.sh

EXPOSE 8000 8123

CMD ["./start.sh"]

