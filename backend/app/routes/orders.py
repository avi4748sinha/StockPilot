from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth import require_auth
from app.db import get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderItemRead, OrderRead


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> OrderRead:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    requested: dict[int, int] = {}
    for item in payload.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    products = list(db.scalars(select(Product).where(Product.id.in_(requested.keys())).with_for_update()))
    product_map = {product.id: product for product in products}
    missing_ids = set(requested) - set(product_map)
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Product not found: {min(missing_ids)}")

    for product_id, quantity in requested.items():
        product = product_map[product_id]
        if product.quantity_in_stock < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.quantity_in_stock}",
            )

    subtotal = Decimal("0.00")
    order = Order(customer_id=customer.id, subtotal_amount=subtotal, discount_percent=payload.discount_percent, discount_amount=Decimal("0.00"), total_amount=subtotal)
    db.add(order)
    db.flush()

    for product_id, quantity in requested.items():
        product = product_map[product_id]
        unit_price = (product.price * (Decimal("100") - product.discount_percent) / Decimal("100")).quantize(Decimal("0.01"))
        line_total = unit_price * quantity
        subtotal += line_total
        product.quantity_in_stock -= quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    discount_amount = (subtotal * payload.discount_percent / Decimal("100")).quantize(Decimal("0.01"))
    order.subtotal_amount = subtotal
    order.discount_amount = discount_amount
    order.total_amount = subtotal - discount_amount
    db.commit()
    return read_order(order.id, db)


@router.get("", response_model=list[OrderRead])
def list_orders(_: dict = Depends(require_auth), db: Session = Depends(get_db)) -> list[OrderRead]:
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
        .order_by(Order.created_at.desc())
    )
    return [serialize_order(order) for order in orders]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> OrderRead:
    return read_order(order_id, db)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, _: dict = Depends(require_auth), db: Session = Depends(get_db)) -> None:
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    for item in order.items:
        item.product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()


def read_order(order_id: int, db: Session) -> OrderRead:
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)


def serialize_order(order: Order) -> OrderRead:
    return OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        customer_email=order.customer.email,
        subtotal_amount=order.subtotal_amount,
        discount_percent=order.discount_percent,
        discount_amount=order.discount_amount,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                sku=item.product.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
    )
