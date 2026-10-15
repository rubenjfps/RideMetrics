from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Activity
from app.schemas.activity import (
    ActivityListItem,
    ActivityListResponse,
)

router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_id() -> str:
    """
    Temporário: substituir pela dependência de autenticação
    antes de disponibilizar o endpoint ao frontend.
    """
    raise HTTPException(
        status_code=501,
        detail="Authentication integration is not implemented yet.",
    )


@router.get("", response_model=ActivityListResponse)
def list_activities(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    total = db.scalar(
        select(func.count())
        .select_from(Activity)
        .where(Activity.user_id == user_id)
    ) or 0

    statement = (
        select(Activity)
        .where(Activity.user_id == user_id)
        .order_by(Activity.started_at.desc())
        .limit(limit)
        .offset(offset)
    )

    activities = db.scalars(statement).all()

    return ActivityListResponse(
        items=[
            ActivityListItem.model_validate(activity)
            for activity in activities
        ],
        total=total,
        limit=limit,
        offset=offset,
    )