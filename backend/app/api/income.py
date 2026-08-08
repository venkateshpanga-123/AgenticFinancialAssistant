from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.income import IncomeCreate
from app.services.income_service import (
    create_income,
    get_all_income,
    get_income,
    update_income,
    delete_income,
)
from app.auth.jwt_handler import verify_token
from app.models.user import User

router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


@router.post("/")
def add_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    return create_income(
        db=db,
        income=income,
        owner_id=db_user.id
    )


@router.get("/")
def read_income(
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    return get_all_income(
        db=db,
        owner_id=db_user.id
    )


@router.get("/{income_id}")
def read_single_income(
    income_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    income = get_income(
        db=db,
        income_id=income_id,
        owner_id=db_user.id
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return income


@router.put("/{income_id}")
def edit_income(
    income_id: int,
    income: IncomeCreate,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    updated = update_income(
        db=db,
        income_id=income_id,
        owner_id=db_user.id,
        income=income
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return updated


@router.delete("/{income_id}")
def remove_income(
    income_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    deleted = delete_income(
        db=db,
        income_id=income_id,
        owner_id=db_user.id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return deleted