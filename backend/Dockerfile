FROM python:3.14-slim

WORKDIR /app

# Install uv package manager from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml .
COPY .python-version .

# Install dependencies using uv
RUN uv sync --frozen --no-dev

# Copy application code
COPY app/ ./app/

# Create output directory for scraped data
RUN mkdir -p /app/output

# Expose port
EXPOSE 3000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run with uv
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
