from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate


def create_expense(db: Session, expense: ExpenseCreate, owner_id: int):
    new_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date,
        owner_id=owner_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


def get_all_expenses(db: Session, owner_id: int):
    return db.query(Expense).filter(
        Expense.owner_id == owner_id
    ).all()


def get_expense(db: Session, expense_id: int, owner_id: int):
    return db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.owner_id == owner_id
    ).first()


def update_expense(
    db: Session,
    expense_id: int,
    owner_id: int,
    expense: ExpenseCreate
):
    db_expense = get_expense(db, expense_id, owner_id)

    if not db_expense:
        return None

    db_expense.title = expense.title
    db_expense.amount = expense.amount
    db_expense.category = expense.category
    db_expense.description = expense.description
    db_expense.date = expense.date

    db.commit()
    db.refresh(db_expense)

    return db_expense


def delete_expense(db: Session, expense_id: int, owner_id: int):
    db_expense = get_expense(db, expense_id, owner_id)

    if not db_expense:
        return None

    db.delete(db_expense)
    db.commit()

    return {"message": "Expense deleted successfully"}