# Crime Data API for Navigation Safety

A Flask-based API that aggregates crime data from multiple sources to provide real-time safety information for navigation algorithms.

## 🚀 Features

- **Real-time Crime Data**: Aggregates data from Philadelphia PD and FBI.
- **Route Safety Analysis**: Analyze safety along navigation routes.
- **Crime Hotspot Detection**: Identify high-risk areas.
- **Risk Scoring**: Intelligent risk assessment based on crime type, severity, and proximity.
- **Caching System**: Redis-backed caching with in-memory fallback.

## 🛠 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd pennapps-2025/backend
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application**:
    ```bash
    python run.py
    ```
    The API will be running at `http://localhost:8000`.

## 🚦 Quick Start

Once the application is running, you can test the API using `curl` or any API client.

```bash
# Health check
curl http://localhost:8000/

# Get nearby crimes (Philadelphia area)
curl "http://localhost:8000/api/crime/nearby?lat=39.9526&lng=-75.1652&radius=1000&hours=24"
```

## 📡 API Endpoints

### Get Nearby Crimes

-   **URL**: `/api/crime/nearby`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `lat` (float, required): Latitude
    -   `lng` (float, required): Longitude
    -   `radius` (int, optional): Search radius in meters (default: 1000)
    -   `hours` (int, optional): Time window in hours (default: 24)

### Route Safety Analysis

-   **URL**: `/api/crime/route-safety`
-   **Method**: `POST`
-   **Request Body**: A JSON object with a `waypoints` array.

### Crime Hotspots

-   **URL**: `/api/crime/hotspots`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `lat` (float, required): Latitude
    -   `lng` (float, required): Longitude
    -   `radius` (int, optional): Search radius in meters (default: 2000)

## 🚀 Deployment

### Production (using Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Docker

```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

## 📝 License

MIT License
