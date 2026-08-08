from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.expense import ExpenseCreate
from app.services.expense_service import (
    create_expense,
    get_all_expenses,
    get_expense,
    update_expense,
    delete_expense,
)
from app.auth.jwt_handler import verify_token
from app.models.user import User

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/")
def add_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    return create_expense(
        db=db,
        expense=expense,
        owner_id=db_user.id
    )


@router.get("/")
def read_expenses(
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    return get_all_expenses(
        db=db,
        owner_id=db_user.id
    )


@router.get("/{expense_id}")
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    expense = get_expense(
        db=db,
        expense_id=expense_id,
        owner_id=db_user.id
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@router.put("/{expense_id}")
def edit_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    updated = update_expense(
        db=db,
        expense_id=expense_id,
        owner_id=db_user.id,
        expense=expense
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return updated


@router.delete("/{expense_id}")
def remove_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    deleted = delete_expense(
        db=db,
        expense_id=expense_id,
        owner_id=db_user.id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return deleted