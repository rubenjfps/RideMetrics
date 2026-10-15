from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models import Activity, ActivityPoint
from app.services.tcx_parser import parse_tcx


def import_tcx_activity(
    db: Session,
    file_path: str | Path,
    user_id: str,
) -> Activity:
    """
    Parse a TCX file and save the activity and its track points.

    The activity and its points are persisted in one transaction.
    """
    parsed = parse_tcx(file_path)

    if parsed["started_at"] is None:
        raise ValueError(
            "The TCX file does not contain a valid activity start date."
        )

    if not user_id or not user_id.strip():
        raise ValueError("A valid user_id is required.")

    source_path = Path(file_path)

    activity = Activity(
        user_id=user_id,
        name=parsed["name"],
        source="upload",
        source_file=source_path.name,
        started_at=parsed["started_at"],
        duration_seconds=parsed["duration_seconds"],
        distance_meters=parsed["distance_meters"],
        elevation_gain_meters=parsed["elevation_gain_meters"],
        average_speed_kmh=parsed["average_speed_kmh"],
        max_speed_kmh=parsed["max_speed_kmh"],
        average_heart_rate=parsed["average_heart_rate"],
        max_heart_rate=parsed["max_heart_rate"],
        average_power_watts=parsed["average_power_watts"],
        max_power_watts=parsed["max_power_watts"],
    )

    try:
        # Insert the activity first to obtain its database ID.
        db.add(activity)
        db.flush()

        points: list[ActivityPoint] = []

        for point in parsed["track_points"]:
            # These fields are required by the database model.
            if (
                point["recorded_at"] is None
                or point["latitude"] is None
                or point["longitude"] is None
            ):
                continue

            points.append(
                ActivityPoint(
                    activity_id=activity.id,
                    recorded_at=point["recorded_at"],
                    latitude=point["latitude"],
                    longitude=point["longitude"],
                    altitude_meters=point["altitude_meters"],
                    distance_meters=point["distance_meters"],
                    heart_rate_bpm=point["heart_rate"],
                    power_watts=point["power_watts"],
                )
            )

        # Batch insert the points.
        if points:
            db.add_all(points)

        db.commit()
        db.refresh(activity)

        return activity

    except Exception:
        db.rollback()
        raise