# Ceramic Studio

Welcome to the Ceramic Studio project! This project consists of three main components:
1. **Frontend (Artisanal-Dinnerware)** - The main storefront (runs on port `8080`)
2. **Admin Panel** - The dashboard for managing products, categories, etc. (runs on port `8081`)
3. **Backend** - The Node.js API server (runs on port `3000`)
4. **Database** - MySQL database

## Getting Started

This project is fully containerized using Docker. To run the entire stack seamlessly, you just need Docker and Docker Compose installed.

### Start the Application
To start the application for the first time, open your terminal in the root folder of this project and run:

```bash
docker compose up -d
```
This will start all the services in the background.

## How to smoothly apply changes

If you make any changes to the code (in the Frontend, Backend, or Admin Panel) and want to deploy them **smoothly** without taking down the server manually, run the following command:

```bash
docker compose up -d --build
```

**Why this is the smoothest way:**
- `--build` forces Docker to rebuild the images with your latest code changes.
- `-d` runs it in the background. 
- Docker Compose is smart enough to **only** restart the containers whose code has actually changed, leaving the others running seamlessly!

### Useful Commands

- **View Logs**: To see what is happening inside the containers in real-time, run:
  ```bash
  docker compose logs -f
  ```
  *(Press `Ctrl+C` to exit the logs view)*

- **Stop the Application**: To stop all containers smoothly:
  ```bash
  docker compose down
  ```

- **Restart a specific service**: If you only want to restart the backend, for example:
  ```bash
  docker compose restart backend
  ```
