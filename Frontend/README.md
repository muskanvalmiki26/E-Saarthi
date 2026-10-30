# 🛡️ E-Saarthi — Women & Citizen Safety Navigation Platform

> An AI-powered safe navigation platform providing dynamic safe route recommendations, real-time crime risk breakdown, 24x7 emergency service directory, and instant one-touch SOS telemetry dispatch.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)
![Status](https://img.shields.io/badge/Status-MVP%20Demo%20Ready-10B981.svg)

---

## 🌟 Core Features

- **🔐 Dynamic Authentication (`/login` & `/register`)**:
  - Secure credential validation, remember me, and **One-Click Academic Demo Login** (Priya Sharma).
- **📊 Home Dashboard (`/dashboard`)**:
  - Real-time Safety Status Score (`78/100 Good`), live location sharing toggle, quick action cards, and GPS telemetry locking.
- **🗺️ Safe Route Planner (`/routes`)**:
  - Interactive Leaflet map with 3 color-coded evaluated routes:
    - 🟢 **Route 1 (Safest / Recommended)**: 92/100 Safety Score (low crime, 96% street lighting, CCTV coverage).
    - 🟡 **Route 2 (Balanced)**: 78/100 Safety Score (moderate risk, fast arterial).
    - 🔴 **Route 3 (Fastest / Unsafe)**: 62/100 Safety Score (high risk, isolated stretches).
- **📋 Safety Parameter Breakdown (`SafetyBreakdownModal`)**:
  - 0–100 progress bars for Street Lighting, Crime Risk Index, Live Traffic, and Accident Blackspots.
  - Live Weather Telemetry (temperature, precipitation, visibility).
- **🧭 Live Turn-by-Turn Navigation HUD (`/navigate`)**:
  - Minimalist navigation HUD, remaining ETA countdown, dynamic hazard warnings (*"Poorly lit stretch ahead in 500m"*).
  - Off-route deviation detector with **"Simulate Off-Route Deviation"** recalculation test button.
  - Floating Quick-SOS button visible at all times.
- **🏥 24x7 Emergency Services Directory (`/emergency-services`)**:
  - Geofenced categories: Police Stations (👮), Emergency Hospitals (🏥), Fire Stations (🚒), 24x7 Pharmacies (💊), and Women Helpdesks (🛡️).
  - One-click phone dial (`tel:`) and direct "Navigate Here" routing.
- **🚨 Instant Emergency SOS Command Center (`/sos`)**:
  - Giant red pulsing button (`PRESS FOR SOS`) with siren audio chime.
  - Live GPS coordinate broadcast to National Helpline (112), Women Helpline (1091), and verified emergency guardians.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Deep Navy Theme `#0F172A` / Clean Slate `#F8FAFC`)
- **Icons**: Lucide React
- **Mapping**: Leaflet + React-Leaflet (CartoDB Positron tiles)
- **State Management**: React Context API (`AuthContext`, `RouteContext`, `SafetyContext`)
- **HTTP Client**: Axios with resilient offline mock fallback layer

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Installation
```bash
git clone <your-repository-url>
cd esaarthi
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔌 REST API Integration

The API client in `src/api/client.js` is preconfigured to talk to backend endpoints:
- `POST /auth/login` & `POST /auth/register`
- `POST /routes/calculate`
- `GET /routes/details/:id`
- `GET /services/nearby?lat=&lng=&type=`
- `POST /sos/trigger`

*Note: In offline mode or if the backend server is unreachable, `src/api/apiService.js` automatically falls back to realistic mock telemetry, ensuring 100% testability during live presentations.*

---

## 📜 License
Distributed under the MIT License.
