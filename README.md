# StockPilot

StockPilot is a full-stack inventory and order management system built for a Software Engineer technical assessment. The application helps businesses manage products, customers, orders, and inventory operations through a responsive React frontend and a FastAPI backend with PostgreSQL support.

## Inventory Manager Login

* Email: `admin@stockpilot.com`
* Password: `admin123`

---

## Features

* Dashboard with product, customer, order, revenue, and low-stock summaries
* Product management with SKU, price, stock, discount, and image URL
* Product image preview and thumbnail support
* Customer management with unique email validation
* Order creation with quantity, discount, and stock validation
* Backend-calculated order totals and discounts
* Automatic stock deduction and restoration
* Secure inventory manager authentication
* Clear validation and error handling

---

## Screenshots

![Dashboard](https://raw.githubusercontent.com/avi4748sinha/StockPilot/main/frontend/public/screenshorts/01.png)

![Products](https://raw.githubusercontent.com/avi4748sinha/StockPilot/main/frontend/public/screenshorts/02.png)

![Customers](https://raw.githubusercontent.com/avi4748sinha/StockPilot/main/frontend/public/screenshorts/03.png)

![Orders](https://raw.githubusercontent.com/avi4748sinha/StockPilot/main/frontend/public/screenshorts/04.png)

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Python
* FastAPI
* SQLAlchemy

### Database

* PostgreSQL

### Containerization

* Docker
* Docker Compose

### Deployment

* Vercel
* Render

---

## Project Structure

```text
StockPilot/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## Environment Variables

Create a `.env` file in the project root and configure:

```env
DATABASE_URL=your_database_url

POSTGRES_DB=stockpilot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

VITE_API_URL=http://localhost:8000

ADMIN_EMAIL=admin@stockpilot.com
ADMIN_PASSWORD=admin123

AUTH_SECRET=your_secret_key
```

---

## Run With Docker

```powershell
docker compose --env-file .env up --build
```

Open:

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:8000`
* API Docs: `http://localhost:8000/docs`

Stop services:

```powershell
docker compose down
```

---

## Run Without Docker

### Backend

```powershell
cd backend

python -m venv .venv

.\.venv\Scripts\activate

pip install -r requirements.txt

Copy-Item .env.example .env

uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend

npm install

npm run dev
```

---

## API Overview

### Authentication

* `POST /auth/login`

### Products

* `POST /products`
* `GET /products`
* `PUT /products/{id}`
* `DELETE /products/{id}`

### Customers

* `POST /customers`
* `GET /customers`
* `DELETE /customers/{id}`

### Orders

* `POST /orders`
* `GET /orders`
* `DELETE /orders/{id}`

---

## Business Rules

* Product SKU must be unique
* Customer email must be unique
* Orders are rejected when inventory is insufficient
* Creating an order deducts stock automatically
* Order totals are calculated by the backend

---

## 🌐 Deployment

### Backend Deployment (Render)

* Push the project to GitHub
* Create a PostgreSQL database on Render
* Create a new Web Service on Render
* Set root directory to `backend`
* Add required environment variables:

  * `DATABASE_URL`
  * `CORS_ORIGINS`
  * `ADMIN_EMAIL`
  * `ADMIN_PASSWORD`
  * `AUTH_SECRET`
* Deploy the backend service

### Frontend Deployment (Vercel)

* Import the `StockPilot` repository in Vercel
* Set root directory to `frontend`
* Add environment variable:

  * `VITE_API_URL`
* Deploy the frontend application

---

## 🌐 Live URLs

Frontend:
stock-pilot-flax.vercel.app

Backend API:
https://stockpilot-backend-yp7d.onrender.com

API Documentation:
https://stockpilot-backend-yp7d.onrender.com/docs

Docker Hub:
https://hub.docker.com/r/avi4748sinha/stockpilot-backend

---

## ✅ Submission Checklist

* Live frontend deployment URL
* Live backend API URL
* Docker Hub backend image link
* GitHub repository with frontend and backend source code
* Dockerized setup using Docker Compose
* API documentation accessible at `/docs`

---

## Author

Avinash Sinha
