import csv
import math
from pathlib import Path

# CSV is stored in the project's ML folder.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CRIME_CSV = (
    PROJECT_ROOT
    / "ML"
    / "data"
    / "final"
    / "crime_safety_scores.csv"
)

# Maximum distance allowed for a district-centroid match.
MAX_DISTANCE_KM = 50.0


def distance_km(lat1, lon1, lat2, lon2):
    """Calculate distance between two geographic coordinates."""
    earth_radius_km = 6371.0

    lat1, lon1, lat2, lon2 = map(
        math.radians, (lat1, lon1, lat2, lon2)
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    return 2 * earth_radius_km * math.asin(
        min(1.0, math.sqrt(a))
    )


def get_nearest_crime_score(latitude, longitude):
    """
    Return the nearest district's historical crime score,
    only if its centroid is within MAX_DISTANCE_KM.
    Return None when no reliable match is available.
    """
    if not CRIME_CSV.is_file():
        return None

    nearest_score = None
    nearest_distance = float("inf")

    try:
        with CRIME_CSV.open(
            "r", encoding="utf-8-sig", newline=""
        ) as file:
            reader = csv.DictReader(file)


            for row in reader:
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                    score = float(row["crime_score"])
                except (KeyError, TypeError, ValueError):
                    continue

                if not (
                    math.isfinite(lat)
                    and math.isfinite(lon)
                    and math.isfinite(score)
                    and -90 <= lat <= 90
                    and -180 <= lon <= 180
                    and 0 <= score <= 100
                ):
                    continue

                distance = distance_km(
                    latitude, longitude, lat, lon
                )

                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest_score = score

        if nearest_distance <= MAX_DISTANCE_KM:
            return round(nearest_score, 2)

    except (OSError, csv.Error):
        return None

    return None

    
TRAFFIC_CSV = (
    PROJECT_ROOT
    / "ML"
    / "data"
    / "final"
    / "traffic_pune_sample.csv"
)

MAX_TRAFFIC_DISTANCE_KM = 5.0


def get_nearest_traffic_score(latitude, longitude):
    """
    Return the nearest traffic score within 5 km.
    Return None if no nearby traffic point is available.
    """
    if not TRAFFIC_CSV.is_file():
        return None

    nearest_score = None
    nearest_distance = float("inf")

    try:
        with TRAFFIC_CSV.open(
            "r", encoding="utf-8-sig", newline=""
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                    score = float(row["traffic_score"])
                except (KeyError, TypeError, ValueError):
                    continue

                if not (
                    math.isfinite(lat)
                    and math.isfinite(lon)
                    and math.isfinite(score)
                    and -90 <= lat <= 90
                    and -180 <= lon <= 180
                    and 0 <= score <= 100
                ):
                    continue

                distance = distance_km(
                    latitude, longitude, lat, lon
                )

                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest_score = score

        if nearest_distance <= MAX_TRAFFIC_DISTANCE_KM:
            return round(nearest_score, 2)

    except (OSError, csv.Error):
        return None

    return None


ROAD_CSV = (
    PROJECT_ROOT
    / "ML"
    / "data"
    / "final"
    / "road_condition_backend.csv"
)

MAX_ROAD_DISTANCE_KM = 5.0


def get_nearest_road_score(latitude, longitude):
    """Return the nearest road-condition score within 5 km."""
    if not ROAD_CSV.is_file():
        return None

    nearest_score = None
    nearest_distance = float("inf")

    try:
        with ROAD_CSV.open(
            "r", encoding="utf-8-sig", newline=""
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                    score = float(row["road_score"])
                except (KeyError, TypeError, ValueError):
                    continue

                if not (
                    math.isfinite(lat)
                    and math.isfinite(lon)
                    and math.isfinite(score)
                    and -90 <= lat <= 90
                    and -180 <= lon <= 180
                    and 0 <= score <= 100
                ):
                    continue

                distance = distance_km(
                    latitude, longitude, lat, lon
                )

                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest_score = score

        if nearest_distance <= MAX_ROAD_DISTANCE_KM:
            return round(nearest_score, 2)

    except (OSError, csv.Error):
        return None

    return None


ACCIDENT_CSV = (
    PROJECT_ROOT
    / "ML"
    / "data"
    / "final"
    / "accident_city_safety_scores.csv"
)

MAX_ACCIDENT_DISTANCE_KM = 25.0


def get_nearest_accident_score(latitude, longitude):
    """
    Return the nearest city-level accident safety score
    within 25 km, or None if no nearby record exists.
    """
    if not ACCIDENT_CSV.is_file():
        return None

    nearest_score = None
    nearest_distance = float("inf")

    try:
        with ACCIDENT_CSV.open(
            "r", encoding="utf-8-sig", newline=""
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                    score = float(row["accident_score"])
                except (KeyError, TypeError, ValueError):
                    continue

                if not (
                    math.isfinite(lat)
                    and math.isfinite(lon)
                    and math.isfinite(score)
                    and -90 <= lat <= 90
                    and -180 <= lon <= 180
                    and 0 <= score <= 100
                ):
                    continue

                distance = distance_km(
                    latitude, longitude, lat, lon
                )

                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest_score = score

        if nearest_distance <= MAX_ACCIDENT_DISTANCE_KM:
            return round(nearest_score, 2)

    except (OSError, csv.Error):
        return None

    return None

def get_route_average_score(coordinates, score_function):
    """
    Calculate average score using available route coordinates.
    Coordinates must be in (longitude, latitude) format.
    """
    scores = []

    if not coordinates:
        return None

    # Sample approximately 20 points across the route
    step = max(1, len(coordinates) // 20)

    sampled_points = coordinates[::step]

    for longitude, latitude in sampled_points:
        score = score_function(latitude, longitude)

        if score is not None:
            scores.append(score)

    if not scores:
        return None

    return round(sum(scores) / len(scores), 2)
