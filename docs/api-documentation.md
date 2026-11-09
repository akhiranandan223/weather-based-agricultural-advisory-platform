# RESTful API Specification
## Weather-Based Agricultural Advisory Platform
### Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Ramesh Patel",
  "email": "ramesh@agroadvisory.in",
  "password": "Password@123",
  "role": "farmer",
  "phone": "+91 94401 56789",
  "state": "Telangana",
  "district": "Warangal",
  "village": "Ananthasagar",
  "farmSize": 5.0,
  "landUnit": "acres",
  "soilType": "Red Sandy Loam",
  "irrigationMethod": "Drip Irrigation"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "673...",
    "name": "Ramesh Patel",
    "email": "ramesh@agroadvisory.in",
    "role": "farmer"
  }
}
```

### 1.2 User Login
- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "farmer@agroadvisory.in",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "673...",
    "name": "Ramesh Patel",
    "role": "farmer"
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Route:** `/api/auth/me`
- **Access:** Private (Bearer Token)
- **Response (200 OK):**
```json
{
  "success": true,
  "user": { ... },
  "farmerProfile": { ... }
}
```

---

## 2. Crop Management Endpoints

### 2.1 Get Crops
- **Method:** `GET`
- **Route:** `/api/crops`
- **Access:** Private

### 2.2 Create Crop
- **Method:** `POST`
- **Route:** `/api/crops`
- **Access:** Private (Farmer, Admin)
- **Request Body:**
```json
{
  "cropName": "Cotton",
  "cropCategory": "Fiber Crop",
  "variety": "Bt Cotton Hybrid",
  "farmArea": 2.5,
  "areaUnit": "acres",
  "sowingDate": "2026-06-15",
  "growthStage": "Flowering / Tillering",
  "soilType": "Black Cotton",
  "irrigationMethod": "Drip Irrigation",
  "notes": "Intercropped with pulses"
}
```

`growthStage` accepts the common stages Germination, Seedling, Vegetative,
Tillering, Flowering, Fruiting, Grain Filling, Maturity, and Harvesting, as well
as their supported combined labels. Crop-specific stages (for example Cotton
Squaring/Boll Formation, Maize Tasseling/Silking, and Rice Panicle Initiation)
are validated against the selected `cropName`.

### 2.3 Update Crop
- **Method:** `PUT`
- **Route:** `/api/crops/:id`
- **Access:** Private (Farmer, Admin)

### 2.4 Delete Crop
- **Method:** `DELETE`
- **Route:** `/api/crops/:id`
- **Access:** Private (Farmer, Admin)

---

## 3. Weather Ingestion Endpoints

### 3.1 Get Current Live Weather
- **Method:** `GET`
- **Route:** `/api/weather/current?city=Warangal` (or `?lat=17.96&lon=79.59`)
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "weather": {
    "city": "Warangal",
    "state": "Telangana",
    "temperature": 31.2,
    "feelsLike": 33.1,
    "humidity": 64,
    "pressure": 1012,
    "windSpeed": 12.4,
    "condition": "Clear",
    "dataSource": "LIVE_API"
  }
}
```

### 3.2 Get 5-Day / 3-Hour Forecast
- **Method:** `GET`
- **Route:** `/api/weather/forecast?city=Warangal`
- **Access:** Public

---

## 4. Agricultural Advisory Endpoints

### 4.1 Get Advisories
- **Method:** `GET`
- **Route:** `/api/advisories`
- **Access:** Private

### 4.2 Trigger Advisory Generation
- **Method:** `POST`
- **Route:** `/api/advisories/generate`
- **Access:** Private
- **Request Body:**
```json
{
  "city": "Warangal"
}
```

---

## 5. Early Warning Weather Alerts

### 5.1 Get Active Alerts
- **Method:** `GET`
- **Route:** `/api/alerts?district=Warangal`
- **Access:** Public

### 5.2 Broadcast Official Alert (Admin)
- **Method:** `POST`
- **Route:** `/api/alerts`
- **Access:** Private (Admin)

---

## 6. Farmer Consultation Queries & Expert Responses

### 6.1 Submit Farmer Query
- **Method:** `POST`
- **Route:** `/api/queries`
- **Access:** Private (Farmer)

### 6.2 Submit Expert Diagnostic Response
- **Method:** `POST`
- **Route:** `/api/expert/responses`
- **Access:** Private (Expert, Admin)
- **Request Body:**
```json
{
  "queryId": "673...",
  "message": "Square dropping is induced by sudden cloudy conditions.",
  "recommendedAction": "Spray Planofix (Alpha NAA) @ 4ml/15L water in early morning.",
  "weatherConsiderations": "Perform spraying only when wind velocity is under 12 km/h.",
  "status": "Answered"
}
```

---

## 7. Mandatory Reports & Exports

- `GET /api/reports/weather-history?city=Warangal&format=csv`
- `GET /api/reports/forecast-summary?city=Warangal&format=csv`
- `GET /api/reports/crop-advisory?format=csv`
- `GET /api/reports/farmer-queries?format=csv`
