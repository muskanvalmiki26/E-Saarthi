from fastapi import FastAPI, Depends, HTTPException, UploadFile, File

from pydantic import BaseModel, Field

from fastapi.middleware.cors import CORSMiddleware

import os

import requests

from database import engine, Base, User, Session, EmergencyContact, SafetyData, SOSRecord, RouteHistory

from security import hash_password, verify_password, create_access_token, get_current_user

import math

from ml_data import (
    get_nearest_crime_score,
    get_nearest_traffic_score,
    get_nearest_road_score,
    get_nearest_accident_score,
    get_route_average_score,
)

from dotenv import load_dotenv

from safety import (
    get_risk_level,
    calculate_safety_score,
    select_route_options,
    validate_ml_safety_output,
    process_ml_prediction
)

load_dotenv()

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class RouteRequest(BaseModel):
    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)
    destination_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)

    crime_score: float | None = Field(default=None, ge=0, le=100)
    traffic_score: float | None = Field(default=None, ge=0, le=100)
    road_score: float | None = Field(default=None, ge=0, le=100)
    accident_score: float | None = Field(default=None, ge=0, le=100)

class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relation: str | None = None

class SafetyDataCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    crime_score: float = Field(..., ge=0, le=100)
    traffic_score: float = Field(..., ge=0, le=100)
    road_score: float = Field(..., ge=0, le=100)
    accident_score: float = Field(..., ge=0, le=100)
    source: str | None = None

ALLOWED_SERVICE_TYPES = {
    "hospital",
    "police",
    "fire_station",
    "pharmacy",
    "ambulance"
}

class EmergencyServiceRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    service_type: str

class SOSRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    message: str | None = None

class ProfileUpdate(BaseModel):
    name: str
    email: str

class RouteSelectionRequest(BaseModel):
    route_id: int = Field(..., ge=1)

    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)

    destination_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)

    safety_score: float | None = Field(None, ge=0, le=100)

class RouteHistoryCreate(BaseModel):
    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)

    destination_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)

    selected_route: str | None = None
    safety_score: float | None = Field(None, ge=0, le=100)

@app.post("/route-history")
def save_route_history(
    route_data: RouteHistoryCreate,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        history = RouteHistory(
            user_id=int(current_user),
            current_latitude=route_data.current_latitude,
            current_longitude=route_data.current_longitude,
            destination_latitude=route_data.destination_latitude,
            destination_longitude=route_data.destination_longitude,
            selected_route=route_data.selected_route,
            safety_score=route_data.safety_score
        )

        db.add(history)
        db.commit()
        db.refresh(history)

        return {
            "message": "Route history saved successfully",
            "id": history.id
        }

    finally:
        db.close()

@app.get("/route-history")
def get_route_history(
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        history = (
            db.query(RouteHistory)
            .filter(RouteHistory.user_id == int(current_user))
            .order_by(RouteHistory.id.desc())
            .all()
        )

        return [
            {
                "id": item.id,
                "current_latitude": item.current_latitude,
                "current_longitude": item.current_longitude,
                "destination_latitude": item.destination_latitude,
                "destination_longitude": item.destination_longitude,
                "selected_route": item.selected_route,
                "safety_score": item.safety_score
            }
            for item in history
        ]

    finally:
        db.close()

@app.delete("/route-history/{history_id}")
def delete_route_history(
    history_id: int,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        history = (
            db.query(RouteHistory)
            .filter(
                RouteHistory.id == history_id,
                RouteHistory.user_id == int(current_user)
            )
            .first()
        )

        if not history:
            raise HTTPException(
                status_code=404,
                detail="Route history not found"
            )

        db.delete(history)
        db.commit()

        return {
            "message": "Route history deleted successfully",
            "history_id": history_id
        }

    finally:
        db.close()

def get_weather_score(latitude: float, longitude: float):
    api_key = os.getenv("OPENWEATHER_API_KEY")

    if not api_key:
        return 70, {"status": "Weather API key not configured"}

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": api_key,
        "units": "metric"
    }

    try:
        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            return 70, {
                "status": "Weather API error",
                "status_code": response.status_code,
                "details": response.text
            }
        weather = response.json()

        condition = weather["weather"][0]["main"].lower()
        temperature = weather["main"]["temp"]
        visibility = weather.get("visibility", 10000)
        rain_1h = weather.get("rain", {}).get("1h", 0)

        if condition == "clear":
            score = 95
        elif condition == "clouds":
            score = 85
        elif condition in ["mist", "fog", "haze", "smoke", "dust", "sand", "ash"]:
            score = 70
        elif condition in ["rain", "drizzle"]:
            score = 60
        elif condition == "thunderstorm":
            score = 35
        else:
            score = 70

        if rain_1h >= 10:
            score -= 15
        elif rain_1h >= 5:
            score -= 10

        if visibility < 2000:
            score -= 15
        elif visibility < 5000:
            score -= 5

        score = max(0, min(100, score))

        return round(score, 2), {
            "condition": condition,
            "temperature_c": temperature,
            "rain_1h_mm": rain_1h,
            "visibility_m": visibility
        }

    except Exception:
        return 70, {"status": "Weather service error"}


def get_safety_data(latitude, longitude):
    db = Session()

    try:
        safety_data = db.query(SafetyData).all()

        if not safety_data:
            return None

        nearest = min(
            safety_data,
            key=lambda data: calculate_distance_km(
                latitude,
                longitude,
                data.latitude,
                data.longitude
            )
        )

        distance = calculate_distance_km(
            latitude,
            longitude,
            nearest.latitude,
            nearest.longitude
        )

        # Ignore unrelated safety records
        if distance > 5:
            return None

        return {
            "crime_score": nearest.crime_score,
            "traffic_score": nearest.traffic_score,
            "road_score": nearest.road_score,
            "accident_score": nearest.accident_score
        }

    finally:
        db.close()

def decode_polyline(polyline):
    coordinates = []
    index = 0
    lat = 0
    lon = 0

    while index < len(polyline):
        result = 0
        shift = 0

        while True:
            b = ord(polyline[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5

            if b < 0x20:
                break

        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat

        result = 0
        shift = 0

        while True:
            b = ord(polyline[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5

            if b < 0x20:
                break

        dlng = ~(result >> 1) if result & 1 else result >> 1
        lon += dlng

        coordinates.append([
            lon / 100000,
            lat / 100000
        ])

    return coordinates

def get_route_safety_data(route_coordinates):
    safety_points = []

    db = Session()

    try:
        safety_data = db.query(SafetyData).all()

        if not safety_data:
            return None

        for coordinate in route_coordinates:
            longitude = coordinate[0]
            latitude = coordinate[1]

            nearest = min(
                safety_data,
                key=lambda data: calculate_distance_km(
                    latitude,
                    longitude,
                    data.latitude,
                    data.longitude
                )
            )

            distance = calculate_distance_km(
                latitude,
                longitude,
                nearest.latitude,
                nearest.longitude
            )

            # Ignore database records farther than 5 km
            if distance > 5:
                continue

            safety_points.append({
                "crime_score": nearest.crime_score,
                "traffic_score": nearest.traffic_score,
                "road_score": nearest.road_score,
                "accident_score": nearest.accident_score
            })

        return safety_points if safety_points else None

    finally:
        db.close()

def calculate_route_safety_factors(route_safety_data):
    if not route_safety_data:
        return None

    factors = [
        "crime_score",
        "traffic_score",
        "road_score",
        "accident_score"
    ]

    route_factors = {}

    for factor in factors:
        values = [
            data[factor]
            for data in route_safety_data
            if data.get(factor) is not None
        ]

        if values:
            route_factors[factor] = round(
                sum(values) / len(values),
                2
            )
        else:
            route_factors[factor] = None

    return route_factors


def calculate_distance_km(lat1, lon1, lat2, lon2):
    earth_radius_km = 6371

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    lat_diff = lat2 - lat1
    lon_diff = lon2 - lon1

    a = (
        math.sin(lat_diff / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(lon_diff / 2) ** 2
    )

    a = max(0, min(1, a))

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    distance = earth_radius_km * c

    return round(distance, 3)

def get_weather_hazard_level(weather_data):
    if not weather_data:
        return {
            "hazard_level": "Unknown",
            "hazard_reason": "Weather data unavailable"
        }

    condition = str(weather_data.get("condition", "")).lower()
    rain = float(weather_data.get("rain_1h_mm", 0) or 0)
    visibility = float(weather_data.get("visibility_m", 10000) or 10000)

    if rain >= 7 or visibility < 1000:
        level = "High"
    elif rain >= 2 or visibility < 3000 or condition in {
        "thunderstorm",
        "heavy rain",
        "fog"
    }:
        level = "Medium"
    else:
        level = "Low"

    return {
        "hazard_level": level,
        "hazard_reason": f"Condition: {condition}, Rain: {rain} mm/h, Visibility: {visibility} m"
    }


def get_nearby_emergency_services(latitude, longitude, service_type):

    if not GEOAPIFY_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Geoapify API key not configured"
        )

    category_map = {
        "hospital": "healthcare.hospital",
        "police": "service.police",
        "fire_station": "service.fire_station",
        "pharmacy": "healthcare.pharmacy",
        "ambulance": "emergency.ambulance_station"
    }

    category = category_map.get(service_type)

    if not category:
        return []

    params = {
        "categories": category,
        "filter": f"circle:{longitude},{latitude},5000",
        "bias": f"proximity:{longitude},{latitude}",
        "limit": 20,
        "apiKey": GEOAPIFY_API_KEY
    }

    try:
        response = requests.get(
            "https://api.geoapify.com/v2/places",
            params=params,
            timeout=15
        )

        response.raise_for_status()
        
        data = response.json()

    except requests.RequestException as e:
        print("Geoapify status:", response.status_code)
        print("Geoapify error details:", response.text[:1000])
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch nearby emergency services"
        )

    services = []

    for feature in data.get("features", []):

        properties = feature.get("properties", {})
        coordinates = feature.get("geometry", {}).get("coordinates", [])

        service_lat = properties.get("lat")
        service_lon = properties.get("lon")

        if service_lat is None and len(coordinates) >= 2:
            service_lon, service_lat = coordinates[:2]

        if service_lat is None or service_lon is None:
            continue

        distance = properties.get("distance")

        if distance is not None:
            distance_km = distance / 1000
        else:
            distance_km = calculate_distance_km(
                latitude,
                longitude,
                service_lat,
                service_lon
            )

        services.append({
            "name": properties.get("name") or properties.get("address_line1") or "Unnamed",
            "latitude": service_lat,
            "longitude": service_lon,
            "service_type": service_type,
            "phone": properties.get("datasource", {}).get("raw", {}).get("phone"),
            "distance_km": round(distance_km, 2)
        })

    services.sort(key=lambda service: service["distance_km"])

    return services[:10]


@app.post("/emergency-services")
def emergency_services(service_request: EmergencyServiceRequest):

    if service_request.service_type not in ALLOWED_SERVICE_TYPES:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Invalid service type",
                "allowed_service_types": list(ALLOWED_SERVICE_TYPES)
            }
        )

    services = get_nearby_emergency_services(
        service_request.latitude,
        service_request.longitude,
        service_request.service_type
    )

    return {
        "count": len(services),
        "services": services
    }

@app.post("/sos")
def create_sos(
    sos_data: SOSRequest,
    user_id: str = Depends(get_current_user)

):
    db = Session()

    try:
        sos = SOSRecord(
            user_id=int(user_id),
            latitude=sos_data.latitude,
            longitude=sos_data.longitude,
            message=sos_data.message,
            status="active"
        )

        db.add(sos)
        db.commit()
        db.refresh(sos)

        contacts = db.query(EmergencyContact).filter(
            EmergencyContact.user_id == int(user_id)
        ).all()

        emergency_contacts = [
            {
                "id": contact.id,
                "name": contact.name,
                "phone": contact.phone,
                "relation": contact.relation
            }
            for contact in contacts
        ]

        return {
            "message": "SOS activated successfully",
            "sos_id": sos.id,
            "user_id": int(user_id),
            "latitude": sos.latitude,
            "longitude": sos.longitude,
            "status": sos.status,
            "emergency_contacts": emergency_contacts
        }

    finally:
        db.close()

@app.get("/sos")
def get_sos_records(
    user_id: str = Depends(get_current_user)
):
    db = Session()

    try:
        records = db.query(SOSRecord).filter(
            SOSRecord.user_id == int(user_id)
        ).order_by(SOSRecord.id.desc()).all()

        result = []

        for record in records:
            result.append({
                "sos_id": record.id,
                "latitude": record.latitude,
                "longitude": record.longitude,
                "message": record.message,
                "status": record.status
            })

        return {
            "count": len(result),
            "sos_records": result
        }

    finally:
        db.close()

@app.put("/sos/{sos_id}/resolve")
def resolve_sos(
    sos_id: int,
    user_id: str = Depends(get_current_user)
):
    db = Session()

    try:
        sos = db.query(SOSRecord).filter(
            SOSRecord.id == sos_id,
            SOSRecord.user_id == int(user_id)
        ).first()

        if not sos:
            raise HTTPException(
                status_code=404,
                detail="SOS record not found"
            )

        if sos.status == "resolved":
            return {
                "message": "SOS is already resolved",
                "sos_id": sos.id,
                "status": sos.status
            }

        sos.status = "resolved"
        db.commit()
        db.refresh(sos)

        return {
            "message": "SOS resolved successfully",
            "sos_id": sos.id,
            "status": sos.status
        }

    finally:
        db.close()

@app.get("/sos-history")
def get_sos_history(
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        history = (
            db.query(SOSRecord)
            .filter(SOSRecord.user_id == int(current_user))
            .order_by(SOSRecord.id.desc())
            .all()
        )

        return [
            {
                "sos_id": item.id,
                "latitude": item.latitude,
                "longitude": item.longitude,
                "message": item.message,
                "status": item.status
            }
            for item in history
        ]

    finally:
        db.close()

@app.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        user = db.query(User).filter(
            User.id == int(current_user)
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }

    finally:
        db.close()

@app.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        user = db.query(User).filter(
            User.id == int(current_user)
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != user.id
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email is already registered"
            )

        user.name = profile_data.name
        user.email = profile_data.email

        db.commit()
        db.refresh(user)

        return {
            "message": "Profile updated successfully",
            "id": user.id,
            "name": user.name,
            "email": user.email
        }

    finally:
        db.close()

def get_route_safety_factors(route_id):
    """
    Returns safety factors for a route.

    Temporary:
    Values are placeholders until real crime, traffic,
    road and accident data are integrated.
    """

    safety_factors = {
        1: {
            "crime_score": 90,
            "traffic_score": 70,
            "road_score": 85,
            "accident_score": 80
        },
        2: {
            "crime_score": 75,
            "traffic_score": 85,
            "road_score": 75,
            "accident_score": 70
        },
        3: {
            "crime_score": 55,
            "traffic_score": 80,
            "road_score": 60,
            "accident_score": 45
        }
    }

    return safety_factors.get(
        route_id,
        {
            "crime_score": 70,
            "traffic_score": 70,
            "road_score": 70,
            "accident_score": 70
        }
    )


Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "eSaarthi Backend is Running"}


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            return {"message": "PostgreSQL Connected Successfully"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/create-user")
def create_user(user_data: UserCreate):
    db = Session()
    try:
        existing_user = db.query(User).filter(
            User.email == user_data.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        hashed_password = hash_password(user_data.password)

        user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "User created successfully",
            "user_id": user.id
        }

    finally:
        db.close()

@app.get("/users", dependencies=[Depends(get_current_user)])
def get_users():
    db = Session()

    users = db.query(User).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email
        })

    db.close()

    return result

@app.post("/safety-data",
    dependencies=[Depends(get_current_user)]
)
def add_safety_data(
    data: SafetyDataCreate
):

    db = Session()

    try:
        safety_data = SafetyData(
            latitude=data.latitude,
            longitude=data.longitude,
            crime_score=data.crime_score,
            traffic_score=data.traffic_score,
            road_score=data.road_score,
            accident_score=data.accident_score,
            source=data.source
        )

        db.add(safety_data)
        db.commit()
        db.refresh(safety_data)

        return {
            "message": "Safety data added successfully",
            "id": safety_data.id
        }

    finally:
        db.close()

@app.post("/safety-data/import-csv")
def import_safety_data_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    import csv
    import io

    db = Session()

    try:
        contents = file.file.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(contents))

        imported_count = 0
        errors = []

        
        for row_number, row in enumerate(reader, start=2):
            try:
                latitude = float(row["latitude"])
                longitude = float(row["longitude"])

                crime_score = float(row["crime_score"])
                traffic_score = float(row["traffic_score"])
                road_score = float(row["road_score"])
                accident_score = float(row["accident_score"])

                if not -90 <= latitude <= 90:
                    raise ValueError("Latitude must be between -90 and 90")

                if not -180 <= longitude <= 180:
                    raise ValueError("Longitude must be between -180 and 180")

                scores = {
                    "crime_score": crime_score,
                    "traffic_score": traffic_score,
                    "road_score": road_score,
                    "accident_score": accident_score
                }

                for score_name, score_value in scores.items():
                    if not 0 <= score_value <= 100:
                        raise ValueError(
                            f"{score_name} must be between 0 and 100"
                        )

                safety_data = SafetyData(
                    latitude=latitude,
                    longitude=longitude,
                    crime_score=crime_score,
                    traffic_score=traffic_score,
                    road_score=road_score,
                    accident_score=accident_score,
                    source=row.get("source")
                )

                db.add(safety_data)
                imported_count += 1

            except Exception as e:
                errors.append({
                    "row": row_number,
                    "error": str(e)
                })

        db.commit()

        return {
            "message": "CSV safety data imported successfully",
            "imported_count": imported_count,
            "errors": errors
        }

    finally:
        db.close()

@app.post("/routes")
def get_routes(route_data: RouteRequest):

    ors_api_key = os.getenv("ORS_API_KEY")

    if not ors_api_key:
        return {"error": "ORS API key is not configured"}

    url = "https://api.heigit.org/openrouteservice/v2/directions/driving-car"

    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json"
    }

    data = {
        "coordinates": [
            [
                route_data.current_longitude,
                route_data.current_latitude
            ],
            [
                route_data.destination_longitude,
                route_data.destination_latitude
            ]
        ],
        "alternative_routes": {
            "target_count": 3,
            "share_factor": 0.8,
            "weight_factor": 2
        },
        "format": "geojson"
    }

    response = requests.post(
        url,
        headers=headers,
        json=data
    )

    print("ORS STATUS:", response.status_code)
    print("ORS RESPONSE:", response.text[:500])

    if response.status_code != 200:
        return {
            "error": "Unable to get routes",
            "status_code": response.status_code,
            "details": response.text
        }

    try:
        result = response.json()
    except ValueError:
        return {
            "error": "Invalid response from routing service",
            "message": "The routing service returned an unexpected response."
        }

    routes = result.get("routes", [])

    if not routes:
        return {
            "error": "No routes found",
            "message": "No route could be generated for the given locations."
        }

    weather_score, weather_info = get_weather_score(
        route_data.destination_latitude,
        route_data.destination_longitude
    )

    weather_hazard = get_weather_hazard_level(weather_info)

    scored_routes = []

    for index, route in enumerate(routes, start=1):
        if "summary" not in route:
            continue


        route_coordinates = decode_polyline(route["geometry"])

        route_safety_data = get_route_safety_data(route_coordinates)

        if (
            route_data.crime_score is not None
            and route_data.traffic_score is not None
            and route_data.road_score is not None
            and route_data.accident_score is not None
        ):
            ml_output = {
                "crime_score": route_data.crime_score,
                "traffic_score": route_data.traffic_score,
                "road_score": route_data.road_score,
                "accident_score": route_data.accident_score
            }

            safety_factors = process_ml_prediction(ml_output)

        elif route_safety_data:
            safety_factors = {}

        else:
            safety_factors = {}


        if safety_factors is None:
            safety_factors = {}

        safety_factors.setdefault("crime_score", None)
        safety_factors.setdefault("traffic_score", None) 
        safety_factors.setdefault("road_score", None)
        safety_factors.setdefault("accident_score", None)
        
        crime_csv_score = get_route_average_score(
            route_coordinates,
            get_nearest_crime_score
        )

        if crime_csv_score is not None:
          safety_factors["crime_score"] = crime_csv_score


        traffic_csv_score = get_route_average_score(
          route_coordinates,
          get_nearest_traffic_score
        )

        if traffic_csv_score is not None:
          safety_factors["traffic_score"] = traffic_csv_score


        road_csv_score = get_route_average_score(
          route_coordinates,
          get_nearest_road_score
        )

        if road_csv_score is not None:
          safety_factors["road_score"] = road_csv_score


        accident_csv_score = get_route_average_score(
          route_coordinates,
          get_nearest_accident_score
        )

        print("ACCIDENT CSV ROUTE SCORE:", accident_csv_score)

        if accident_csv_score is not None:
          safety_factors["accident_score"] = accident_csv_score

        safety_factors["weather_score"] = weather_score

        safety_score = calculate_safety_score(
            crime_score=safety_factors["crime_score"],
            traffic_score=safety_factors["traffic_score"],
            weather_score=safety_factors["weather_score"],
            road_score=safety_factors["road_score"],
            accident_score=safety_factors["accident_score"]
        )
        available_factors = [
          safety_factors.get("crime_score"),
          safety_factors.get("traffic_score"),
          safety_factors.get("weather_score"),
          safety_factors.get("road_score"),
          safety_factors.get("accident_score")
        ]

        available_count = sum(
          score is not None for score in available_factors
        )

        is_provisional = available_count < 5

        data_coverage = round(
          sum(
            weight
            for score, weight in zip(
              available_factors,
              [0.30, 0.20, 0.15, 0.20, 0.15]
            )
            if score is not None
          ) * 100,
          2
        )

        risk_level = get_risk_level(safety_score)

        scored_routes.append({
            "route_id": index,
            "distance_km": round(
                route["summary"]["distance"] / 1000, 2
            ),
            "duration_minutes": round(
            route["summary"]["duration"] / 60
            ),
            "duration_seconds": route["summary"]["duration"],
            "safety_score": safety_score,
            "risk_level": risk_level,
            "provisional": is_provisional,
            "data_coverage": data_coverage,
            "safety_factors": safety_factors,
            "weather_info": weather_info,
            "weather_hazard": weather_hazard,
            "geometry": route["geometry"]
        })


    for r in scored_routes:
      print(
        "ROUTE:", r["route_id"],
        "SAFETY:", r["safety_score"],
        "DURATION:", r["duration_seconds"]
      )    
    
    route_options = select_route_options(scored_routes)

    return {
        "route_count": len(scored_routes),
        "routes": scored_routes,
        "recommended_routes": route_options
    }

@app.post("/select-route")
def select_route(
    selection_data: RouteSelectionRequest,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        history = RouteHistory(
            user_id=int(current_user),
            current_latitude=selection_data.current_latitude,
            current_longitude=selection_data.current_longitude,
            destination_latitude=selection_data.destination_latitude,
            destination_longitude=selection_data.destination_longitude,
            selected_route=str(selection_data.route_id),
            safety_score=selection_data.safety_score
        )

        db.add(history)
        db.commit()
        db.refresh(history)

        return {
            "message": "Route selected and saved successfully",
            "user_id": int(current_user),
            "selected_route_id": selection_data.route_id,
            "safety_score": history.safety_score,
            "history_id": history.id
        }

    finally:
        db.close()

@app.post("/login")
def login(user_data: UserLogin):
    db = Session()

    try:
        user = db.query(User).filter(
            User.email == user_data.email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not verify_password(
            user_data.password,
            user.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email
        })

        return {
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user.id,
            "name": user.name,
            "email": user.email
        }

    finally:
        db.close()

@app.post("/emergency-contacts")
def add_emergency_contact(
    contact_data: EmergencyContactCreate,
    user_id: str = Depends(get_current_user)
):
    db = Session()

    contact = EmergencyContact(
        user_id=int(user_id),
        name=contact_data.name,
        phone=contact_data.phone,
        relation=contact_data.relation
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)
    db.close()

    return {
        "message": "Emergency contact added successfully",
        "contact_id": contact.id
    }

@app.get("/emergency-contacts")
def get_emergency_contacts(
    user_id: str = Depends(get_current_user)
):
    db = Session()

    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == int(user_id)
    ).all()

    result = []

    for contact in contacts:
        result.append({
            "id": contact.id,
            "name": contact.name,
            "phone": contact.phone,
            "relation": contact.relation
        })

    db.close()

    return result

@app.put("/emergency-contact/{contact_id}")
def update_emergency_contact(
    contact_id: int,
    contact_data: EmergencyContactCreate,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        contact = (
            db.query(EmergencyContact)
            .filter(
                EmergencyContact.id == contact_id,
                EmergencyContact.user_id == int(current_user)
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Emergency contact not found"
            )

        contact.name = contact_data.name
        contact.phone = contact_data.phone
        contact.relation = contact_data.relation

        db.commit()
        db.refresh(contact)

        return {
            "message": "Emergency contact updated successfully",
            "contact_id": contact.id,
            "name": contact.name,
            "phone": contact.phone,
            "relation": contact.relation
        }

    finally:
        db.close()

@app.delete("/emergency-contact/{contact_id}")
def delete_emergency_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user)
):
    db = Session()

    try:
        contact = (
            db.query(EmergencyContact)
            .filter(
                EmergencyContact.id == contact_id,
                EmergencyContact.user_id == int(current_user)
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Emergency contact not found"
            )

        db.delete(contact)
        db.commit()

        return {
            "message": "Emergency contact deleted successfully",
            "contact_id": contact_id
        }

    finally:
        db.close()


@app.get("/sos/{sos_id}/contacts")
def get_sos_contacts(
    sos_id: int,
    user_id: str = Depends(get_current_user)
):
    db = Session()

    try:
        # Check that SOS belongs to logged-in user
        sos = db.query(SOSRecord).filter(
            SOSRecord.id == sos_id,
            SOSRecord.user_id == int(user_id)
        ).first()

        if not sos:
            raise HTTPException(
                status_code=404,
                detail="SOS record not found"
            )

        # Get user's emergency contacts
        contacts = db.query(EmergencyContact).filter(
            EmergencyContact.user_id == int(user_id)
        ).all()

        result = []

        for contact in contacts:
            result.append({
                "name": contact.name,
                "phone": contact.phone,
                "relation": contact.relation
            })

        return {
            "sos_id": sos.id,
            "sos_status": sos.status,
            "latitude": sos.latitude,
            "longitude": sos.longitude,
            "message": sos.message,
            "emergency_contacts": result
        }

    finally:
        db.close()

class DeviationRequest(BaseModel):
    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)

    route_latitude: float = Field(..., ge=-90, le=90)
    route_longitude: float = Field(..., ge=-180, le=180)

    threshold_km: float = Field(default=0.2, ge=0)

class RouteProgressRequest(BaseModel):
    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)
    route_latitude: float = Field(..., ge=-90, le=90)
    route_longitude: float = Field(..., ge=-180, le=180)

class HazardAlertRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

def generate_hazard_alert(latitude, longitude):

    weather_score, weather_info = get_weather_score(
        latitude,
        longitude
    )

    alerts = []

    condition = weather_info.get("condition", "").lower()
    rain = weather_info.get("rain_1h_mm", 0)
    visibility = weather_info.get("visibility_m", 10000)

    if condition == "thunderstorm":
        alerts.append("Thunderstorm detected. Avoid travelling if possible.")

    if rain >= 10:
        alerts.append("Heavy rain detected. Road conditions may be unsafe.")

    if visibility < 2000:
        alerts.append("Low visibility detected. Travel carefully.")

    return {
        "weather_score": weather_score,
        "weather_info": weather_info,
        "hazard_alerts": alerts,
        "alert_count": len(alerts)
    }

@app.post("/hazard-alerts")
def hazard_alerts(
    data: HazardAlertRequest,
    current_user: User = Depends(get_current_user)
):

    result = generate_hazard_alert(
        data.latitude,
        data.longitude
    )

    return result


@app.post("/route-deviation")
def check_route_deviation(data: DeviationRequest):

    distance = calculate_distance_km(
        data.current_latitude,
        data.current_longitude,
        data.route_latitude,
        data.route_longitude
    )

    deviated = distance > data.threshold_km

    return {
        "distance_from_route_km": distance,
        "threshold_km": data.threshold_km,
        "route_deviation": deviated
    }

@app.post("/route-progress")
def route_progress(data: RouteProgressRequest):

    distance = calculate_distance_km(
        data.current_latitude,
        data.current_longitude,
        data.route_latitude,
        data.route_longitude
    )

    return {
        "current_location": {
            "latitude": data.current_latitude,
            "longitude": data.current_longitude
        },
        "route_location": {
            "latitude": data.route_latitude,
            "longitude": data.route_longitude
        },
        "distance_from_route_km": distance
    }

class RerouteRequest(BaseModel):
    current_latitude: float = Field(..., ge=-90, le=90)
    current_longitude: float = Field(..., ge=-180, le=180)

    destination_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)

@app.post("/reroute")
def reroute(route_data: RerouteRequest):

    ors_api_key = os.getenv("ORS_API_KEY")

    if not ors_api_key:
        return {"error": "ORS API key is not configured"}

    url = "https://api.heigit.org/openrouteservice/v2/directions/driving-car"

    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json"
    }

    data = {
        "coordinates": [
            [
                route_data.current_longitude,
                route_data.current_latitude
            ],
            [
                route_data.destination_longitude,
                route_data.destination_latitude
            ]
        ],
        "format": "geojson"
    }

    
    try:
        response = requests.post(
            url,
            headers=headers,
            json=data,
            timeout=30
        )

        if response.status_code != 200:
            return {
                "error": "Unable to get routes",
                "status_code": response.status_code,
                "details": response.text
            }

    except requests.exceptions.Timeout:
        return {
            "error": "Routing service timeout",
            "message": "The routing service took too long to respond. Please try again."
        }

    except requests.exceptions.RequestException:
        return {
            "error": "Routing service unavailable",
            "message": "Unable to connect to the routing service. Please try again later."
        }

    try:
        result = response.json()
    except ValueError:
        return {
            "error": "Invalid routing response",
            "message": "The routing service returned an unexpected response."
        }

    routes = result.get("routes", [])

    if not routes:
        return {
            "error": "No route found",
            "message": "Unable to generate a new route."
        }

    route = routes[0]

    route_coordinates = route["geometry"]["coordinates"]

    route_safety_data = get_route_safety_data(route_coordinates)
    print("ROUTE SAFETY DATA:", route_safety_data[:2] if route_safety_data else None)
    print("INITIAL SAFETY FACTORS:", safety_factors)
    print("ROUTE INPUT SCORES:", route_data.crime_score, route_data.traffic_score, route_data.road_score, route_data.accident_score)

    if route_safety_data:
        safety_factors = calculate_route_safety_factors(
            route_safety_data
        )
    else:
        safety_factors = get_safety_data(
            route_data.current_latitude,
            route_data.current_longitude
        )

    if safety_factors is None:
        safety_factors = get_route_safety_factors(1)

    weather_score, weather_info = get_weather_score(
        route_data.destination_latitude,
        route_data.destination_longitude
    )

    weather_hazard = get_weather_hazard_level(weather_info)

    safety_factors["weather_score"] = weather_score

    safety_score = calculate_safety_score(
        crime_score=safety_factors["crime_score"],
        traffic_score=safety_factors["traffic_score"],
        weather_score=safety_factors["weather_score"],
        road_score=safety_factors["road_score"],
        accident_score=safety_factors["accident_score"]
    )

    risk_level = (
        get_risk_level(safety_score)
        if safety_score is not None
        else "Unavailable"
    )

    return {
        "message": "New route generated successfully",

        "distance_km": round(
            route["summary"]["distance"] / 1000, 2
        ),

        "duration_minutes": round(
            route["summary"]["duration"] / 60
        ),

        "safety_score": safety_score,

        "risk_level": risk_level,

        "safety_factors": safety_factors,

        "weather_info": weather_info,

        "weather_hazard": weather_hazard,

        "geometry": route["geometry"]
    }
