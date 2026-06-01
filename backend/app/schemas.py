from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    sku: str = Field(min_length=2, max_length=60)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    discount_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=90, max_digits=5, decimal_places=2)
    image_url: str | None = Field(default=None, max_length=500)
    quantity_in_stock: int = Field(ge=0)

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("image_url")
    @classmethod
    def normalize_image_url(cls, value: str | None) -> str | None:
        value = value.strip() if value else None
        return value or None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    sku: str | None = Field(default=None, min_length=2, max_length=60)
    price: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    discount_percent: Decimal | None = Field(default=None, ge=0, le=90, max_digits=5, decimal_places=2)
    image_url: str | None = Field(default=None, max_length=500)
    quantity_in_stock: int | None = Field(default=None, ge=0)

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str | None) -> str | None:
        return value.strip().upper() if value else value


class ProductRead(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=40)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(min_length=1)
    discount_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=50, max_digits=5, decimal_places=2)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: EmailStr
    subtotal_amount: Decimal
    discount_percent: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    created_at: datetime
    items: list[OrderItemRead]


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
    total_revenue: Decimal


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=2, max_length=120)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ActivityItem(BaseModel):
    id: int
    type: str
    title: str
    description: str
    created_at: datetime
