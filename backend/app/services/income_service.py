from sqlalchemy.orm import Session

from app.models.income import Income
from app.schemas.income import IncomeCreate


def create_income(db: Session, income: IncomeCreate, owner_id: int):
    new_income = Income(
        source=income.source,
        amount=income.amount,
        description=income.description,
        date=income.date,
        owner_id=owner_id
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income


def get_all_income(db: Session, owner_id: int):
    return db.query(Income).filter(
        Income.owner_id == owner_id
    ).all()


def get_income(db: Session, income_id: int, owner_id: int):
    return db.query(Income).filter(
        Income.id == income_id,
        Income.owner_id == owner_id
    ).first()


def update_income(
    db: Session,
    income_id: int,
    owner_id: int,
    income: IncomeCreate
):
    db_income = get_income(db, income_id, owner_id)

    if not db_income:
        return None

    db_income.source = income.source
    db_income.amount = income.amount
    db_income.description = income.description
    db_income.date = income.date

    db.commit()
    db.refresh(db_income)

    return db_income


def delete_income(db: Session, income_id: int, owner_id: int):
    db_income = get_income(db, income_id, owner_id)

    if not db_income:
        return None

    db.delete(db_income)
    db.commit()

    return {"message": "Income deleted successfully"}