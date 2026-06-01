# StockPilot

StockPilot is a full-stack inventory and order management system built for a Software Engineer technical assessment. It supports product management, customer records, order creation, inventory tracking, and backend-calculated totals in a Dockerized React, FastAPI, and PostgreSQL setup.

Inventory manager login:

- Email: `admin@stockpilot.com`
- Password: `admin123`

Change these credentials before deploying.

## Features

- Dashboard with product, customer, order, revenue, low-stock, recent order, and activity summaries
- Product management with SKU, price, stock, discount, and image URL
- Product image preview while adding/editing products
- Product table with image thumbnail or `No Image` fallback
- Customer management with unique email validation
- Order creation with customer selection, multiple products, quantity, discount, and live total preview
- Backend-calculated product discount, order discount, subtotal, and final total
- Automatic stock deduction after order creation
- Stock restoration when an order is cancelled
- Low-stock and order status badges
- Toast notifications and clear API error messages
- Simple inventory manager login

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Python, FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Containerization: Docker, Docker Compose
- Deployment target: Vercel frontend, Railway backend and PostgreSQL

## Project Structure

```text
StockPilot/
  backend/
    app/
      routes/
        products.py
        customers.py
        orders.py
      main.py
      db.py
      models.py
      schemas.py
      config.py
      auth.py
    requirements.txt
    Dockerfile
    .dockerignore
    .env.example
  frontend/
    public/
    src/
    Dockerfile
    .dockerignore
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    nginx.conf
  docker-compose.yml
  .gitignore
  README.md
```

## Environment Variables

Create a root `.env` file for Docker Compose:

```env
POSTGRES_DB=StockPilot
POSTGRES_USER=StockPilot
POSTGRES_PASSWORD=change_this_password
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:3000
VITE_API_URL=http://localhost:8000
ADMIN_EMAIL=admin@stockpilot.com
ADMIN_PASSWORD=admin123
AUTH_SECRET=change_this_to_a_long_random_value
```

For local backend development, copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` if your PostgreSQL credentials are different.

## Run With Docker

```powershell
docker compose --env-file .env up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

Stop services:

```powershell
docker compose down
```

Remove containers and database volume:

```powershell
docker compose down -v
```

## Run Without Docker

Create a local PostgreSQL database named `StockPilot`.

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## API Overview

Auth:

- `POST /auth/login`

Dashboard:

- `GET /dashboard`
- `GET /activity`

Products:

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Customers:

- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`

Orders:

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

## Business Rules

- Product SKU must be unique.
- Customer email must be unique.
- Product stock cannot be negative.
- Orders are rejected when inventory is insufficient.
- Creating an order deducts product stock.
- Cancelling an order restores product stock.
- Product discounts are applied by the backend.
- Order discounts are applied by the backend.
- Final order totals are calculated by the backend.
- APIs return appropriate validation, not found, conflict, unauthorized, and server error responses.

## Docker Hub Image

Backend image:

```powershell
docker build -t your-dockerhub-username/inventory-api:latest ./backend
docker push your-dockerhub-username/inventory-api:latest
```

Docker Hub repository names must be lowercase.

## Deployment

Railway backend variables:

```env
DATABASE_URL=<railway-postgres-url>
CORS_ORIGINS=<vercel-frontend-url>
ADMIN_EMAIL=admin@stockpilot.com
ADMIN_PASSWORD=<strong-password>
AUTH_SECRET=<long-random-secret>
```

Railway start command if running as a Python service:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Vercel frontend settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=<railway-backend-url>`

## Submission Checklist

- GitHub repository link
- Docker Hub backend image link
- Live Vercel frontend URL
- Live Railway backend API URL
- API docs working at `/docs`
- Login works with the inventory manager account
- Product image URL and discount fields working
- Order stock validation tested

## Author

Avinash Sinha
