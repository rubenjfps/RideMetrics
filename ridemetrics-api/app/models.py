from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = (
        Index("ix_activities_user_id", "user_id"),
        Index("ix_activities_started_at", "started_at"),
        {"schema": "ridemetrics"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ID do utilizador criado pelo Next.js/Prisma.
    # Não duplicamos a tabela User no schema ridemetrics.
    user_id: Mapped[str] = mapped_column(
        String(191),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="upload",
    )

    source_file: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    duration_seconds: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    distance_meters: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    elevation_gain_meters: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    average_speed_kmh: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 3),
        nullable=True,
    )

    max_speed_kmh: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 3),
        nullable=True,
    )

    average_heart_rate: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    max_heart_rate: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    average_power_watts: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    max_power_watts: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

class ActivityPoint(Base):
    __tablename__ = "activity_points"

    __table_args__ = (
        Index(
            "ix_activity_points_activity_id_recorded_at",
            "activity_id",
            "recorded_at",
        ),
        {"schema": "ridemetrics"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    activity_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "ridemetrics.activities.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    latitude: Mapped[Decimal] = mapped_column(
        Numeric(10, 7),
        nullable=False,
    )

    longitude: Mapped[Decimal] = mapped_column(
        Numeric(10, 7),
        nullable=False,
    )

    altitude_meters: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 2),
        nullable=True,
    )

    distance_meters: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    heart_rate_bpm: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    cadence_rpm: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    power_watts: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )