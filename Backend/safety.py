def get_risk_level(safety_score: float):
    if safety_score >= 80:
        return "Low"
    elif safety_score >= 60:
        return "Medium"
    else:
        return "High"


def calculate_safety_score(
    crime_score: float,
    traffic_score: float,
    weather_score: float,
    road_score: float,
    accident_score: float
):
    scores = [
        crime_score,
        traffic_score,
        weather_score,
        road_score,
        accident_score
    ]

    scores = [
        max(0, min(100, score))
        for score in scores
    ]

    crime_score, traffic_score, weather_score, road_score, accident_score = scores

    score = (
        crime_score * 0.30 +
        traffic_score * 0.20 +
        weather_score * 0.15 +
        road_score * 0.20 +
        accident_score * 0.15
    )
    return round(max(0, min(100, score)), 2)

def select_route_options(routes):
    if not routes:
        return {
            "safest": None,
            "balanced": None,
            "fastest": None
        }

    safest = max(
        routes,
        key=lambda r: r["safety_score"]
    )

    fastest = min(
        routes,
        key=lambda r: r["duration_minutes"]
    )

    min_duration = min(
        r["duration_minutes"] for r in routes
    )
    max_duration = max(
        r["duration_minutes"] for r in routes
    )

    for route in routes:
        if max_duration == min_duration:
            time_score = 100
        else:
            time_score = (
                (max_duration - route["duration_minutes"])
                / (max_duration - min_duration)
            ) * 100

        route["balanced_score"] = round(
            route["safety_score"] * 0.6
            + time_score * 0.4,
            2
        )

    balanced = max(
        routes,
        key=lambda r: r["balanced_score"]
    )

    return {
        "safest": safest["route_id"],
        "balanced": balanced["route_id"],
        "fastest": fastest["route_id"]
    }


def validate_ml_safety_output(ml_output):
    """
    Validates safety scores received from ML/Data module.
    Expected scores: 0 to 100.
    """

    required_fields = [
        "crime_score",
        "traffic_score",
        "road_score",
        "accident_score"
    ]

    for field in required_fields:
        if field not in ml_output:
            raise ValueError(f"Missing ML safety field: {field}")

        try:
            value = float(ml_output[field])
        except (TypeError, ValueError):
            raise ValueError(f"Invalid value for {field}")

        if value < 0 or value > 100:
            raise ValueError(f"{field} must be between 0 and 100")

    return {
        "crime_score": float(ml_output["crime_score"]),
        "traffic_score": float(ml_output["traffic_score"]),
        "road_score": float(ml_output["road_score"]),
        "accident_score": float(ml_output["accident_score"])
    }

def process_ml_prediction(ml_output):
    """
    Processes output received from the ML/Data module
    and converts it into the format used by the backend.
    """

    validated_output = validate_ml_safety_output(ml_output)

    return {
        "crime_score": validated_output["crime_score"],
        "traffic_score": validated_output["traffic_score"],
        "road_score": validated_output["road_score"],
        "accident_score": validated_output["accident_score"]
    }