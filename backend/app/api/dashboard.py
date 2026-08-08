from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database.database import get_db
from app.models.expense import Expense

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==============================
# Total Expense
# ==============================
@router.get("/total-expense")
def total_expense(db: Session = Depends(get_db)):
    total = db.query(func.sum(Expense.amount)).scalar()

    return {
        "total_expense": total if total else 0
    }


# ==============================
# Category Summary
# ==============================
@router.get("/category-summary")
def category_summary(db: Session = Depends(get_db)):
    summary = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .group_by(Expense.category)
        .all()
    )

    return [
        {
            "category": item.category,
            "total": item.total
        }
        for item in summary
    ]


# ==============================
# Monthly Summary
# ==============================
@router.get("/monthly-summary")
def monthly_summary(db: Session = Depends(get_db)):
    current_month = datetime.now().month

    total = (
        db.query(func.sum(Expense.amount))
        .filter(func.extract("month", Expense.date) == current_month)
        .scalar()
    )

    return {
        "month": datetime.now().strftime("%B"),
        "total": total if total else 0
    }