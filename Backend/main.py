from fastapi import FastAPI

from fastapi import FastAPI, Depends

from pydantic import BaseModel

import os

import requests

from database import engine, Base, User, Session, EmergencyContact, SafetyData, SOSRecord

from security import hash_password, verify_password, create_access_token, get_current_user

import math

from dotenv import load_dotenv

from safety import get_risk_level, calculate_safety_score, select_route_options

load_dotenv()

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class RouteRequest(BaseModel):
    current_latitude: float
    current_longitude: float
    destination_latitude: float
    destination_longitude: float

class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relation: str | None = None

class EmergencyServiceRequest(BaseModel):
    latitude: float
    longitude: float
    service_type: str

class SOSRequest(BaseModel):
    latitude: float
    longitude: float
    message: str | None = None

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
            key=lambda data: (
                (data.latitude - latitude) ** 2
                + (data.longitude - longitude) ** 2
            )
        )

        return {
            "crime_score": nearest.crime_score,
            "traffic_score": nearest.traffic_score,
            "road_score": nearest.road_score,
            "accident_score": nearest.accident_score
        }

    finally:
        db.close()

def get_nearby_emergency_services(latitude, longitude, service_type):

    query = f"""
    [out:json];
    (
      node["amenity"="{service_type}"](around:5000,{latitude},{longitude});
      way["amenity"="{service_type}"](around:5000,{latitude},{longitude});
    );
    out center;
    """

    headers = {
        "User-Agent": "eSaarthi/1.0 (Thakur College Data Science Project)",
        "Accept": "application/json",
        "Content-Type": "text/plain"
    }

    response = requests.post(
        "https://overpass-api.de/api/interpreter",
        data=query,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    services = []

    for element in data.get("elements", []):
        tags = element.get("tags", {})

        if element["type"] == "node":
            service_lat = element.get("lat")
            service_lon = element.get("lon")
        else:
            center = element.get("center", {})
            service_lat = center.get("lat")
            service_lon = center.get("lon")

        if service_lat is None or service_lon is None:
            continue

        # Calculate approximate distance from user's location
        lat_diff = service_lat - latitude
        lon_diff = service_lon - longitude

        distance = math.sqrt(
            lat_diff ** 2 + lon_diff ** 2
        ) * 111

        services.append({
            "name": tags.get("name", "Unnamed"),
            "latitude": service_lat,
            "longitude": service_lon,
            "service_type": service_type,
            "phone": tags.get("phone"),
            "distance_km": round(distance, 2)
        })

    # Nearest service first
    services.sort(key=lambda service: service["distance_km"])

    return services
@app.post("/emergency-services")
def emergency_services(service_request: EmergencyServiceRequest):

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
    db.close()

    return {
        "message": "SOS activated successfully",
        "sos_id": sos.id,
        "user_id": int(user_id),
        "latitude": sos.latitude,
        "longitude": sos.longitude,
        "status": sos.status
    }

@app.get("/sos")
def get_sos_records(
    user_id: str = Depends(get_current_user)
):
    db = Session()

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

    db.close()

    return {
        "count": len(result),
        "sos_records": result
    }

@app.put("/sos/{sos_id}/resolve")
def resolve_sos(
    sos_id: int,
    user_id: str = Depends(get_current_user)
):
    db = Session()

    sos = db.query(SOSRecord).filter(
        SOSRecord.id == sos_id,
        SOSRecord.user_id == int(user_id)
    ).first()

    if not sos:
        db.close()
        return {"error": "SOS record not found"}

    sos.status = "resolved"

    db.commit()
    db.refresh(sos)
    db.close()

    return {
        "message": "SOS resolved successfully",
        "sos_id": sos.id,
        "status": sos.status
    }

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

    hashed_password = hash_password(user_data.password)

    user = User(
    name=user_data.name,
    email=user_data.email,
    password=hashed_password
)

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {
        "message": "User created successfully",
        "user_id": user.id
    }

@app.get("/users")
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

    if response.status_code != 200:
        return {
            "error": "Unable to get routes",
            "status_code": response.status_code,
            "details": response.text
        }

    result = response.json()

    routes = []
    weather_score, weather_info = get_weather_score(
            route_data.destination_latitude,
            route_data.destination_longitude
    )

    for index, route in enumerate(result.get("routes", []), start=1):
        safety_factors = get_safety_data(
          route_data.current_latitude,
          route_data.current_longitude
        )
        if safety_factors is None:
            safety_factors = get_route_safety_factors(index)

        safety_factors["weather_score"] = weather_score
        safety_score = calculate_safety_score(
            crime_score=safety_factors["crime_score"],
            traffic_score=safety_factors["traffic_score"],
            weather_score=safety_factors["weather_score"],
            road_score=safety_factors["road_score"],
            accident_score=safety_factors["accident_score"]
        )

        risk_level = get_risk_level(safety_score)

        routes.append({
            "route_id": index,
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
            "geometry": route["geometry"]
       })

    route_options = select_route_options(routes)

    return {
        "routes": routes,
        "recommended_routes": route_options
    }
    
@app.get("/profile")
def profile(user_id: str = Depends(get_current_user)):
    return {
        "message": "Token is valid",
        "user_id": user_id
    }

@app.post("/login")
def login(user_data: UserLogin):
    db = Session()

    user = db.query(User).filter(User.email == user_data.email).first()

    if not user:
        db.close()
        return {"error": "Invalid email or password"}

    if not verify_password(user_data.password, user.password):
        db.close()
        return {"error": "Invalid email or password"}

    access_token = create_access_token({
    "sub": str(user.id),
    "email": user.email
})

    db.close()

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

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