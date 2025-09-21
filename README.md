# PennApps 2025 Project

This project contains a React frontend and a Python Flask backend.

## Running Locally (Recommended)

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (which includes npm)
- [Python 3](https://www.python.org/downloads/)

### Setup

1.  **Install root dependencies**:
    This will install `concurrently` which is used to run both servers at the same time.
    ```bash
    npm install
    ```

2.  **Install frontend dependencies**:
    ```bash
    npm install --prefix frontend
    ```

3.  **Set up the backend environment**:
    Create a Python virtual environment for the backend.
    ```bash
    python3 -m venv backend/venv
    ```

4.  **Install backend dependencies**:
    Install the required Python packages into the virtual environment.
    ```bash
    backend/venv/bin/pip install -r backend/requirements.txt
    ```

5.  **Compile Backend Cython Module**:
    The backend uses a C++ extension for performance. Compile it with this command:
    ```bash
    backend/venv/bin/python setup.py build_ext --inplace
    ```

## Running the Application

To start both the frontend and backend servers for local development, run one of the following commands from the root directory:

```bash
npm start
# or
npm run dev
```

This will:
- Start the Flask backend server on `http://localhost:5002`.
- Start the React frontend development server (usually on `http://localhost:3000`).

The console output from both servers will be displayed in your terminal, with color-coding to distinguish between them.

---

## Connecting a Deployed Frontend to Your Local Backend

This workflow allows you to test a deployed frontend (e.g., on Vercel) with your local backend, providing a much faster development loop than deploying the backend for every change.

### Prerequisites

- [ngrok](https://ngrok.com/docs/getting-started) installed and configured.
  ```bash
  # Install ngrok (on macOS with Homebrew)
  brew install ngrok

  # Add your authtoken from the ngrok dashboard
  ngrok config add-authtoken YOUR_AUTHTOKEN
  ```

### 1. Run the Backend with a Public URL

Run the following command from the project root:

```bash
npm run start:backend:public
```

This starts your backend and creates a secure tunnel using ngrok. Look for the public URL in the terminal output, which will look like `https://<random-string>.ngrok-free.app`.

### 2. Configure Your Vercel Project

1. Go to your project's dashboard on Vercel.
2. Go to **Settings > Environment Variables**.
3. Add a new variable:
    - **Name**: `VITE_PRODUCTION_API_URL`
    - **Value**: Paste the `ngrok` URL you copied.
4. Save and redeploy your Vercel project.

Your deployed frontend will now send API requests to your local backend server.

---

## Running with Docker (Alternative)

This method uses Docker to run the application in isolated containers. It's useful for ensuring a consistent environment but may be slower for rapid development.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

### Running the Application

1.  **Build and start the containers**:
    From the root directory, run:
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for both the frontend and backend and then start the services.

2.  **Access the application**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:8000](http://localhost:8000)

3.  **Stopping the application**:
    Press `Ctrl + C` in the terminal, and then run the following command to stop and remove the containers:
    ```bash
    docker-compose down
    ```
