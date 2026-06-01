from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import require_auth
from app.db import get_db
from app.models import Customer, Order
from app.schemas import CustomerCreate, CustomerRead


router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> Customer:
    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Customer email already exists") from exc
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerRead])
def list_customers(_: dict = Depends(require_auth), db: Session = Depends(get_db)) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.full_name)))


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> None:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    has_orders = db.scalar(select(func.count(Order.id)).where(Order.customer_id == customer_id))
    if has_orders:
        raise HTTPException(status_code=409, detail="Customers with orders cannot be deleted")

    db.delete(customer)
    db.commit()
