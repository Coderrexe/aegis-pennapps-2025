FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire project
COPY . .

# Install dependencies, including the Cython extension
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN pip install .

# Set the working directory to the backend folder
WORKDIR /app/backend

# Create non-root user and set permissions
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
# For production, Gunicorn is used.
# The command in docker-compose.yml will override this for development.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "main:app"]
