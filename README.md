# PennApps 2025 Project

This project contains a React frontend and a Python FastAPI backend.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (which includes npm)
- [Python 3](https://www.python.org/downloads/)

## Setup

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
    Create a Python virtual environment for the backend. If you've run the setup with me before, this is already done.
    ```bash
    python3 -m venv backend/venv
    ```

4.  **Install backend dependencies**:
    Install the required Python packages into the virtual environment.
    ```bash
    backend/venv/bin/pip install -r backend/requirements.txt
    ```

## Running the Application

To start both the frontend and backend servers simultaneously, run the following command from the root directory:

```bash
npm start
```

This will:
- Start the FastAPI backend server on `http://localhost:8000`.
- Start the React frontend development server (usually on `http://localhost:3000`).

The console output from both servers will be displayed in your terminal, with color-coding to distinguish between them.
