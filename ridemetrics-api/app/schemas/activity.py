from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ActivityListItem(BaseModel):
    id: int
    name: str
    source: str
    started_at: datetime
    duration_seconds: int
    distance_meters: Decimal
    elevation_gain_meters: Decimal | None = None
    average_speed_kmh: Decimal | None = None
    average_heart_rate: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ActivityListResponse(BaseModel):
    items: list[ActivityListItem]
    total: int
    limit: int
    offset: int