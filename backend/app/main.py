from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.auth import create_token, require_auth
from app.config import get_settings
from app.db import Base, engine, get_db
from app.models import Customer, Order, Product
from app.routes import customers, orders, products
from app.schemas import ActivityItem, DashboardSummary, LoginRequest, LoginResponse


settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [{"field": ".".join(map(str, error["loc"][1:])), "msg": error["msg"]} for error in exc.errors()]
    return JSONResponse(status_code=400, content={"detail": errors})


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Database connection failed. Check DATABASE_URL and PostgreSQL status."},
    )


@app.on_event("startup")
def on_startup() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0'))
            connection.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)'))
            connection.execute(text('ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0'))
            connection.execute(text('ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0'))
            connection.execute(text('ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0'))
            connection.execute(text('UPDATE orders SET subtotal_amount = total_amount WHERE subtotal_amount = 0'))
    except SQLAlchemyError as exc:
        print(f"Database startup check failed: {exc}")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    if payload.email != settings.admin_email or payload.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return LoginResponse(access_token=create_token(payload.email))


@app.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(_: dict = Depends(require_auth), db: Session = Depends(get_db)) -> DashboardSummary:
    return DashboardSummary(
        total_products=db.scalar(select(func.count(Product.id))) or 0,
        total_customers=db.scalar(select(func.count(Customer.id))) or 0,
        total_orders=db.scalar(select(func.count(Order.id))) or 0,
        total_revenue=db.scalar(select(func.coalesce(func.sum(Order.total_amount), 0))) or Decimal("0.00"),
        low_stock_products=db.scalar(select(func.count(Product.id)).where(Product.quantity_in_stock <= 5)) or 0,
    )


@app.get("/activity", response_model=list[ActivityItem])
def latest_activity(_: dict = Depends(require_auth), db: Session = Depends(get_db)) -> list[ActivityItem]:
    recent_orders = db.scalars(
        select(Order).options(selectinload(Order.customer)).order_by(Order.created_at.desc()).limit(5)
    )
    recent_customers = db.scalars(select(Customer).order_by(Customer.created_at.desc()).limit(3))
    recent_products = db.scalars(select(Product).order_by(Product.created_at.desc()).limit(3))

    activity = [
        ActivityItem(
            id=order.id,
            type="order",
            title=f"Order #{order.id} created",
            description=f"{order.customer.full_name} - Rs. {order.total_amount}",
            created_at=order.created_at,
        )
        for order in recent_orders
    ]
    activity.extend(
        ActivityItem(
            id=customer.id,
            type="customer",
            title="Customer added",
            description=customer.full_name,
            created_at=customer.created_at,
        )
        for customer in recent_customers
    )
    activity.extend(
        ActivityItem(
            id=product.id,
            type="product",
            title="Product added",
            description=f"{product.name} - {product.sku}",
            created_at=product.created_at,
        )
        for product in recent_products
    )
    return sorted(activity, key=lambda item: item.created_at, reverse=True)[:8]
