def get_risk_level(safety_score: float):
    if safety_score >= 80:
        return "Low"
    elif safety_score >= 50:
        return "Medium"
    else: 
        return "High"



def calculate_safety_score(
    crime_score=None,
    traffic_score=None,
    weather_score=None,
    road_score=None,
    accident_score=None
):
    weights = {
        "crime_score": 0.30,
        "traffic_score": 0.20,
        "weather_score": 0.15,
        "road_score": 0.20,
        "accident_score": 0.15
    }

    scores = {
        "crime_score": crime_score,
        "traffic_score": traffic_score,
        "weather_score": weather_score,
        "road_score": road_score,
        "accident_score": accident_score
    }

    available = {
        key: max(0, min(100, value))
        for key, value in scores.items()
        if value is not None
    }

    if not available:
        return None

    total_weight = sum(weights[key] for key in available)

    safety_score = sum(
        available[key] * weights[key]
        for key in available
    ) / total_weight

    return round(max(0, min(100, safety_score)), 2)

def select_route_options(routes):
    if not routes:
        return {
            "safest": None,
            "balanced": None,
            "fastest": None
        }

    # Safest: highest safety score
    safest = max(
        routes,
        key=lambda r: (
            r["safety_score"],
            -r["duration_seconds"]
        )
    )

    # Fastest: minimum exact travel time
    fastest = min(
        routes,
        key=lambda r: (
            r["duration_seconds"],
            -r["safety_score"]
        )
    )

    min_duration = min(
        r["duration_seconds"] for r in routes
    )
    max_duration = max(
        r["duration_seconds"] for r in routes
    )

    for route in routes:
        if max_duration == min_duration:
            time_score = 100
        else:
            time_score = (
                (max_duration - route["duration_seconds"])
                / (max_duration - min_duration)
            ) * 100

        route["balanced_score"] = round(
            route["safety_score"] * 0.6 + time_score * 0.4,
            2
        )

    # Balanced: 60% safety + 40% travel time
    balanced = max(
        routes,
        key=lambda r: (
            r["balanced_score"],
            r["safety_score"],
            -r["duration_seconds"]
        )
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