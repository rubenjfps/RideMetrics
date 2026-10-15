from datetime import datetime
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET


TCX_NAMESPACE = {
    "tcx": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2",
}


class TCXParserError(Exception):
    """Raised when a TCX file cannot be parsed."""


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _get_float(element: ET.Element | None) -> float | None:
    if element is None or element.text is None:
        return None

    try:
        return float(element.text)
    except ValueError:
        return None


def _get_int(element: ET.Element | None) -> int | None:
    value = _get_float(element)
    return int(value) if value is not None else None


def _find_extension_value(
    trackpoint: ET.Element,
    suffix: str,
) -> float | None:
    """
    Find an extension value by XML tag name, regardless of its namespace.
    """
    for element in trackpoint.iter():
        if element.tag.endswith(f"}}{suffix}") and element.text:
            try:
                return float(element.text)
            except ValueError:
                continue

    return None


def parse_tcx(file_path: str | Path) -> dict[str, Any]:
    """
    Parse a TCX file into an activity summary and track points.

    This function does not write to the database.
    """
    path = Path(file_path)

    if not path.is_file():
        raise TCXParserError("The TCX file could not be found.")

    try:
        root = ET.parse(path).getroot()
    except (ET.ParseError, OSError) as exc:
        raise TCXParserError(
            "The TCX file is invalid or could not be read."
        ) from exc

    activity = root.find(
        ".//tcx:Activities/tcx:Activity",
        TCX_NAMESPACE,
    )

    if activity is None:
        raise TCXParserError("No activity was found in the TCX file.")

    # TCX Activity/Id is normally the activity start timestamp,
    # not a descriptive activity name.
    started_at = _parse_datetime(
        activity.findtext("tcx:Id", namespaces=TCX_NAMESPACE)
    )

    laps = activity.findall("tcx:Lap", TCX_NAMESPACE)

    total_duration = 0.0
    total_distance = 0.0
    total_calories = 0
    has_calories = False

    for lap in laps:
        duration = _get_float(
            lap.find("tcx:TotalTimeSeconds", TCX_NAMESPACE)
        )
        distance = _get_float(
            lap.find("tcx:DistanceMeters", TCX_NAMESPACE)
        )
        calories = _get_int(
            lap.find("tcx:Calories", TCX_NAMESPACE)
        )

        if duration is not None:
            total_duration += duration

        if distance is not None:
            total_distance += distance

        if calories is not None:
            total_calories += calories
            has_calories = True

    track_points: list[dict[str, Any]] = []
    heart_rates: list[int] = []
    altitudes: list[float] = []
    recorded_speeds: list[float] = []
    powers: list[int] = []

    for trackpoint in activity.findall(
        ".//tcx:Trackpoint",
        TCX_NAMESPACE,
    ):
        recorded_at = _parse_datetime(
            trackpoint.findtext("tcx:Time", namespaces=TCX_NAMESPACE)
        )

        position = trackpoint.find("tcx:Position", TCX_NAMESPACE)

        latitude = _get_float(
            position.find("tcx:LatitudeDegrees", TCX_NAMESPACE)
            if position is not None else None
        )
        longitude = _get_float(
            position.find("tcx:LongitudeDegrees", TCX_NAMESPACE)
            if position is not None else None
        )

        altitude = _get_float(
            trackpoint.find("tcx:AltitudeMeters", TCX_NAMESPACE)
        )
        distance = _get_float(
            trackpoint.find("tcx:DistanceMeters", TCX_NAMESPACE)
        )
        heart_rate = _get_int(
            trackpoint.find(
                "tcx:HeartRateBpm/tcx:Value",
                TCX_NAMESPACE,
            )
        )

        speed_mps = _find_extension_value(trackpoint, "Speed")
        power_value = _find_extension_value(trackpoint, "Watts")
        power = int(power_value) if power_value is not None else None

        point = {
            "recorded_at": recorded_at,
            "latitude": latitude,
            "longitude": longitude,
            "altitude_meters": altitude,
            "distance_meters": distance,
            "heart_rate": heart_rate,
            "speed_meters_per_second": speed_mps,
            "power_watts": power,
        }

        track_points.append(point)

        if heart_rate is not None:
            heart_rates.append(heart_rate)

        if altitude is not None:
            altitudes.append(altitude)

        if speed_mps is not None and speed_mps >= 0:
            recorded_speeds.append(speed_mps)

        if power is not None:
            powers.append(power)

    # Use the greatest cumulative distance recorded in the trackpoints
    # when it exceeds the distance reported by the laps.
    point_distances = [
        point["distance_meters"]
        for point in track_points
        if point["distance_meters"] is not None
    ]

    if point_distances:
        total_distance = max(total_distance, max(point_distances))

    # Global average speed = total distance / total elapsed time.
    average_speed_kmh = (
        round((total_distance / total_duration) * 3.6, 3)
        if total_duration > 0 and total_distance > 0
        else None
    )

    # This is the maximum speed found in the recorded extensions.
    max_speed_kmh = (
        round(max(recorded_speeds) * 3.6, 3)
        if recorded_speeds
        else None
    )

    average_heart_rate = (
        round(sum(heart_rates) / len(heart_rates))
        if heart_rates
        else None
    )

    max_heart_rate = max(heart_rates) if heart_rates else None

    # Simple positive altitude-difference sum. GPS/barometric noise
    # may affect this estimate; smoothing can be added later.
    elevation_gain = None

    if len(altitudes) >= 2:
        elevation_gain = round(
            sum(
                max(0.0, current - previous)
                for previous, current in zip(
                    altitudes,
                    altitudes[1:],
                )
            ),
            2,
        )

    # TCX Activity does not normally contain a descriptive activity name.
    # Use the filename until a name is supplied by another source.
    activity_name = path.stem

    return {
        "name": activity_name,
        "started_at": started_at,
        "duration_seconds": round(total_duration),
        "distance_meters": round(total_distance, 2),
        "elevation_gain_meters": elevation_gain,
        "average_speed_kmh": average_speed_kmh,
        "max_speed_kmh": max_speed_kmh,
        "average_heart_rate": average_heart_rate,
        "max_heart_rate": max_heart_rate,
        "average_power_watts": (
            round(sum(powers) / len(powers))
            if powers else None
        ),
        "max_power_watts": max(powers) if powers else None,
        "calories": total_calories if has_calories else None,
        "track_points": track_points,
        "track_points_count": len(track_points),
    }