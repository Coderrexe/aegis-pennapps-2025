FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for compiling C++ extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and setup files first to leverage Docker layer caching
COPY backend/requirements.txt setup.py ./

# Install build dependencies and then all other dependencies
RUN pip install --no-cache-dir setuptools cython
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY backend/ backend/

# Compile the Cython/C++ extension
RUN python setup.py build_ext --inplace

# Expose the correct port for the Flask application
EXPOSE 5002

# Command to run the application
# This will be overridden by docker-compose for local development,
# but is good practice to have a default.
CMD ["python", "-m", "backend.app"]
