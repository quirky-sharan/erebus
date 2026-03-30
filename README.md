# 🛰️ OrbitLex — Mission Compliance & Debris Impact Analyser

![OrbitLex Banner](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzFjd2Z1NHR6aXU5YTRxNDFhZmY3NXpxcDh4eWM3ZHVkMGR6ZW1iNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif)

> **OrbitLex** is a full-stack AI/ML web application that allows users to search any satellite or mission, retrieve its orbital parameters, assess regulatory compliance across five international frameworks, predict its deorbit timeline using physics-based modelling, simulate debris impact risk, and generate a downloadable mission report — all in one unified dashboard.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Firebase Setup](#2-firebase-setup)
  - [3. Space-Track Account](#3-space-track-account)
  - [4. Groq API Key](#4-groq-api-key)
  - [5. Frontend Setup](#5-frontend-setup)
  - [6. Backend Setup](#6-backend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Test Satellites](#test-satellites)
- [API Reference](#api-reference)

---

## Overview

![Satellite Tracking](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh4aHV5bmpjaHNicWZ3NjZhZWhkMHYxenl1bDhvNmZ5NnV3dGkxdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRuo6sLetdllPAQ/giphy.gif)

OrbitLex addresses a critical gap in the space industry: the lack of a unified tool for satellite compliance checking, deorbit prediction, and debris risk assessment. Built for the IEEE Hackathon, it brings together live satellite data, regulatory intelligence, and AI-generated reporting into a single accessible platform.

**Core Capabilities:**
- 🔍 Live satellite search via CelesTrak and Space-Track APIs
- 📜 Automated compliance checking against IADC, FCC, ESA, UN OST, and UN COPUOS frameworks
- ⏳ Physics-based deorbit timeline prediction with Monte Carlo uncertainty bounds
- 💥 Debris fragmentation and collision probability simulation
- 🤖 AI-generated mission reports using Groq LLM + RAG
- 📄 Downloadable PDF mission reports

---

## Tech Stack

### 🖥️ Frontend

| Technology | Purpose |
|---|---|
| **React 18 + Vite** | Single-page application framework with fast HMR builds |
| **Three.js** | 3D starfield background, Earth globe, and orbital visualisations |
| **GSAP** | High-performance animations — text reveals, number counters, scroll triggers |
| **Framer Motion** | Page transitions, card animations, and component-level motion |
| **Tailwind CSS v3** | Utility-first CSS framework for the dark space design system |
| **Firebase (Google OAuth)** | One-click Google sign-in with JWT session management |
| **Axios** | HTTP client for all API communication with the FastAPI backend |
| **React Router DOM** | Client-side routing across all application pages |
| **Lucide React** | Consistent icon library throughout the UI |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| **Python FastAPI** | High-performance async API framework — routes, orchestration, middleware |
| **sgp4** | Parses Two-Line Element (TLE) sets and derives orbital parameters |
| **NumPy + SciPy** | Physics engine — orbital mechanics equations and numerical integration |
| **sentence-transformers** | Embeds policy document chunks for semantic search (RAG layer) |
| **FAISS (faiss-cpu)** | In-memory vector index for fast policy document retrieval |
| **Groq API + Llama 3.3 70B** | LLM for generating narrative compliance reports and summaries |
| **ReportLab** | Programmatic PDF generation — streamed directly to the client |
| **firebase-admin** | Server-side Firebase JWT verification middleware |
| **httpx** | Async HTTP client for CelesTrak and Space-Track API calls |

### 🗄️ Data Sources

| Source | Data Provided |
|---|---|
| **CelesTrak REST API** | Live TLE data fetched by satellite name or NORAD ID |
| **Space-Track.org REST API** | Operator, country, launch date, mission type, operational status |
| **Hardcoded Policy Documents** | IADC, FCC, ESA, UN OST, UN COPUOS — embedded in RAG store at startup |

### ☁️ Deployment

| Platform | Purpose |
|---|---|
| **Vercel** | Frontend hosting with automatic Vite builds from GitHub |
| **Railway** | Backend hosting with environment variable management |

---

## Project Structure

```
orbitlex/
├── orbitlex-frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # AuthContext, global state
│   │   ├── firebase/           # Firebase config and auth helpers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level page components
│   │   └── main.jsx            # App entry point
│   ├── .env                    # Frontend environment variables (not committed)
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── orbitlex-backend/
    ├── main.py                 # FastAPI app, CORS, route registration
    ├── auth.py                 # Firebase JWT verification middleware
    ├── modules/
    │   ├── satellite.py        # TLE fetch and orbital parameter parser
    │   ├── compliance.py       # Rule-based framework compliance engine
    │   ├── deorbit.py          # PPL physics engine + Monte Carlo simulation
    │   ├── debris.py           # Debris fragmentation and collision classifier
    │   ├── rag.py              # FAISS vector store + policy retrieval
    │   └── report.py           # Groq LLM narration + ReportLab PDF
    ├── data/
    │   └── policy_docs.py      # Policy text for the RAG store
    ├── .env                    # Backend environment variables (not committed)
    └── requirements.txt
```

---

## Prerequisites

Before running OrbitLex locally, ensure the following are in place.

- **Node.js** v18 or higher
- **Python** 3.10 or higher
- **pip** (Python package manager)
- A **Firebase project** with Google Auth enabled (see setup below)
- A **Space-Track.org** account (free registration, approval may take up to 24 hours)
- A **Groq API key** (free tier at console.groq.com)

---

## Setup & Installation

![Setup](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmRzY3VjbGlhNWxmc3Zkb3A2ZG52anZjNjQ5Y2MxZ3VnNTc1NWp1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/du3J3cXyzhj75IOgvA/giphy.gif)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/orbitlex.git
cd orbitlex
```

---

### 2. Firebase Setup

> ⚠️ This step is fully manual and cannot be automated.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project named `orbitlex`.
2. Navigate to **Authentication → Sign-in method** and enable the **Google** provider.
3. Under **Authentication → Settings → Authorized domains**, add:
   - `localhost`
   - Your production Vercel URL (after deployment)
4. Go to **Project Settings → General → Your apps → Web app** and copy the Firebase config object. You will need these values for the frontend `.env` file.
5. Go to **Project Settings → Service accounts → Generate new private key**. This downloads a JSON file. Base64-encode it for the backend environment variable.

```bash
# Base64-encode the service account JSON on Mac/Linux:
base64 -i serviceAccountKey.json | tr -d '\n'
```

---

### 3. Space-Track Account

> ⚠️ Register early — account approval can take up to 24 hours.

1. Register a free account at [www.space-track.org/auth/createAccount](https://www.space-track.org/auth/createAccount).
2. Note your email and password for the backend `.env` file.
3. The backend enforces a maximum of **30 requests per hour** per Space-Track's rate limit policy. Retry logic with a 3-second delay is already implemented in `satellite.py`.

---

### 4. Groq API Key

1. Sign up at [console.groq.com](https://console.groq.com).
2. Navigate to **API Keys → Create API key**.
3. Copy the key for the backend `.env` file.
4. The free tier provides 30 requests/minute and 6,000 tokens/minute — sufficient for hackathon use.

---

### 5. Frontend Setup

```bash
cd orbitlex-frontend

# Install all dependencies
npm install three @react-three/fiber @react-three/drei
npm install gsap framer-motion firebase axios react-router-dom
npm install lucide-react react-icons
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create the frontend environment file:

```bash
# orbitlex-frontend/.env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` to version control. Ensure it is listed in `.gitignore`.

Add the required Google Fonts to `index.html` inside the `<head>` tag:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

---

### 6. Backend Setup

```bash
cd orbitlex-backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

`requirements.txt`:
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
httpx==0.27.0
sgp4==2.22
numpy==1.26.4
scipy==1.13.0
sentence-transformers==2.7.0
faiss-cpu==1.8.0
groq==0.6.0
reportlab==4.2.0
firebase-admin==6.5.0
python-dotenv==1.0.1
pydantic==2.7.0
```

Create the backend environment file:

```bash
# orbitlex-backend/.env
GROQ_API_KEY=gsk_your_groq_key_here
SPACE_TRACK_USER=your_email@example.com
SPACE_TRACK_PASS=your_space_track_password
FIREBASE_SERVICE_ACCOUNT=base64_encoded_service_account_json
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

> ⚠️ Never commit `.env` to version control. Ensure it is listed in `.gitignore`.

> 📌 On first backend startup, `sentence-transformers` will download the `all-MiniLM-L6-v2` model (~80 MB). This requires an internet connection and only happens once.

---

## Environment Variables

### Frontend (`orbitlex-frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend |

### Backend (`orbitlex-backend/.env`)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B |
| `SPACE_TRACK_USER` | Space-Track.org account email |
| `SPACE_TRACK_PASS` | Space-Track.org account password |
| `FIREBASE_SERVICE_ACCOUNT` | Base64-encoded Firebase service account JSON |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

---

## Running the Application

### Start the Backend

```bash
cd orbitlex-backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI server will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### Start the Frontend

```bash
cd orbitlex-frontend
npm run dev
```

The React application will be available at `http://localhost:5173`.

---

## Deployment

### Frontend — Vercel

1. Push the `orbitlex-frontend` folder to a GitHub repository.
2. Connect the repository to [vercel.com](https://vercel.com).
3. Set the framework preset to **Vite**.
4. Add all `VITE_*` environment variables in the Vercel project dashboard.
5. Set the build command to `npm run build` and the output directory to `dist`.

### Backend — Railway

1. Push the `orbitlex-backend` folder to a GitHub repository.
2. Create a new project on [railway.app](https://railway.app) and connect the repository.
3. Add all backend environment variables in the Railway dashboard.
4. Set the start command to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. After the first deploy, copy the Railway-generated URL and add it to both `ALLOWED_ORIGINS` (backend env) and `VITE_API_BASE_URL` (frontend env on Vercel).

---

## Test Satellites

The following three satellites are required as demo cases for the hackathon judging panel. Each one produces a meaningfully different compliance and risk report.

| Satellite | NORAD ID | Orbit | Country | Demo Value |
|---|---|---|---|---|
| **ISS** | 25544 | LEO 408 km | Multi-national | Most tracked object — rich data, generally compliant |
| **STARLINK-1007** | 44713 | LEO 550 km | USA | FCC 5-year rule applies — commercial LEO case |
| **COSMOS 2251** | 22675 | LEO 789 km | Russia | Defunct debris — HIGH risk — dramatic non-compliant demo |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — confirms backend is running |
| `GET` | `/api/search?name={name}` | Fetch TLE data + metadata for a satellite by name |
| `POST` | `/api/compliance` | Run compliance check against all 5 frameworks |
| `POST` | `/api/deorbit` | Predict deorbit timeline with Monte Carlo bounds |
| `POST` | `/api/debris` | Estimate fragmentation and collision risk |
| `POST` | `/api/report` | Generate LLM narrative report via Groq |
| `GET` | `/api/pdf?satellite={name}` | Generate and stream downloadable PDF report |

All endpoints except `/health` require a valid Firebase JWT token passed as:
```
Authorization: Bearer <token>
```

---

## Common Issues & Fixes

| Issue | Fix |
|---|---|
| `faiss-cpu` import error | Reinstall: `pip install --force-reinstall faiss-cpu` |
| CelesTrak returns no data | Test directly: ISS, STARLINK-1007, COSMOS 2251 by NORAD ID as fallback |
| CORS errors in browser | Add exact Vercel URL (no trailing slash) to `ALLOWED_ORIGINS` |
| PDF not downloading | Ensure frontend uses `axios` with `responseType: 'blob'` and `URL.createObjectURL(blob)` |
| Custom cursor on mobile | Check `'ontouchstart' in window` — do not mount `<CustomCursor />` on touch devices |
| Three.js laggy on mobile | Reduce star count to 1200 if `window.innerWidth < 768` |
| Firebase JWT failing | Confirm `Authorization: Bearer <token>` header is sent from React on every request |

---

<div align="center">
  <sub>Built for the IEEE Hackathon &nbsp;◈&nbsp; OrbitLex &nbsp;◈&nbsp; Powered by Groq + CelesTrak + Space-Track</sub>
</div>
