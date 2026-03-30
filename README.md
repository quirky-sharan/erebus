<div align="center">

# 🛰️ OrbitLex
### Mission Compliance & Debris Impact Analyser

<br/>

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)

<br/>

> **OrbitLex** is a full-stack AI/ML web application that allows users to search any satellite or mission, retrieve its orbital parameters, assess regulatory compliance across five international frameworks, predict its deorbit timeline using physics-based modelling, simulate debris impact risk, and generate a downloadable mission report — all in one unified dashboard.

<br/>

![Vercel](https://img.shields.io/badge/Frontend-Vercel-000?style=flat-square&logo=vercel)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Hackathon](https://img.shields.io/badge/IEEE_Hackathon-2025-orange?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Test Satellites](#test-satellites)
- [API Reference](#api-reference)
- [Common Issues & Fixes](#common-issues--fixes)

---

## Overview

![Satellite Tracking](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh4aHV5bmpjaHNicWZ3NjZhZWhkMHYxenl1bDhvNmZ5NnV3dGkxdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRuo6sLetdllPAQ/giphy.gif)

OrbitLex addresses a critical gap in the space industry: the absence of a unified tool for satellite compliance checking, deorbit prediction, and debris risk assessment. Built for the IEEE Hackathon, it brings together live satellite data, regulatory intelligence, and AI-generated reporting into a single accessible platform.

<br/>

<div align="center">

| 🔍 | 📜 | ⏳ | 💥 | 🤖 | 📄 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Live Satellite Search | Regulatory Compliance | Deorbit Prediction | Debris Simulation | AI Report Generation | PDF Export |
| via CelesTrak & Space-Track | IADC · FCC · ESA · UN OST · COPUOS | Physics + Monte Carlo | Fragmentation & Collision Risk | Groq LLM + RAG | ReportLab Stream |

</div>

---

## Tech Stack

### 🖥️ Frontend

<div align="center">

![React](https://img.shields.io/badge/React_18_+_Vite-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

<br/>

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

<br/>

### ⚙️ Backend

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LLM-F55036?style=for-the-badge&logoColor=white)

</div>

<br/>

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

<br/>

### 🗄️ Data Sources

| Source | Data Provided |
|---|---|
| **CelesTrak REST API** | Live TLE data fetched by satellite name or NORAD ID |
| **Space-Track.org REST API** | Operator, country, launch date, mission type, operational status |
| **Hardcoded Policy Documents** | IADC, FCC, ESA, UN OST, UN COPUOS — embedded in RAG store at startup |

<br/>

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

## Environment Variables

### Frontend — `orbitlex-frontend/.env`

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend |

### Backend — `orbitlex-backend/.env`

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B |
| `SPACE_TRACK_USER` | Space-Track.org account email |
| `SPACE_TRACK_PASS` | Space-Track.org account password |
| `FIREBASE_SERVICE_ACCOUNT` | Base64-encoded Firebase service account JSON |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

> ⚠️ Never commit `.env` files to version control. Ensure both are listed in `.gitignore`.

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

<br/>

### Start the Frontend

```bash
cd orbitlex-frontend
npm run dev
```

The React application will be available at `http://localhost:5173`.

---

## Test Satellites

The following three satellites are the required demo cases for the judging panel. Each produces a meaningfully different compliance profile and risk output.

<br/>

<div align="center">

| Satellite | NORAD ID | Orbit | Country | Expected Outcome |
|:---:|:---:|:---:|:---:|:---|
| 🟢 **ISS** | `25544` | LEO 408 km | Multi-national | Rich data · Generally compliant · Ideal baseline |
| 🟡 **STARLINK-1007** | `44713` | LEO 550 km | USA | FCC 5-year rule applies · Commercial LEO case |
| 🔴 **COSMOS 2251** | `22675` | LEO 789 km | Russia | Defunct debris · HIGH risk · Non-compliant demo |

</div>

---

## API Reference

<div align="center">

```
BASE URL — http://localhost:8000
All endpoints except /health require:  Authorization: Bearer <Firebase_JWT>
```

</div>

<br/>

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/health` | Health check — confirms backend is running |
| `GET` | `/api/search?name={name}` | Fetch live TLE data and metadata for a satellite |
| `POST` | `/api/compliance` | Run compliance check against all 5 regulatory frameworks |
| `POST` | `/api/deorbit` | Predict deorbit timeline with 95% Monte Carlo confidence bounds |
| `POST` | `/api/debris` | Estimate fragmentation risk and annual collision probability |
| `POST` | `/api/report` | Generate LLM narrative report via Groq + RAG retrieval |
| `GET` | `/api/pdf?satellite={name}` | Generate and stream a downloadable PDF mission report |

---

## Common Issues & Fixes

| Issue | Fix |
|---|---|
| `faiss-cpu` import error | Reinstall: `pip install --force-reinstall faiss-cpu` |
| CelesTrak returns no data | Fall back to NORAD ID search — test with ISS (`25544`) first |
| CORS errors in browser | Add exact Vercel URL (no trailing slash) to `ALLOWED_ORIGINS` |
| PDF not downloading in browser | Use `axios` with `responseType: 'blob'` and `URL.createObjectURL(blob)` |
| Custom cursor breaking on mobile | Check `'ontouchstart' in window` — skip mounting `<CustomCursor />` on touch |
| Three.js performance on mobile | Reduce star count to `1200` when `window.innerWidth < 768` |
| Firebase JWT rejected by backend | Confirm `Authorization: Bearer <token>` header is sent on every request |
| `sentence-transformers` slow startup | First-run downloads `all-MiniLM-L6-v2` (~80 MB) — requires internet, cached after |

---

<div align="center">

<br/>

```
ORBITLEX  ◈  Mission Compliance & Debris Impact Analyser
Built for the IEEE Hackathon  ◈  Powered by Groq · CelesTrak · Space-Track
```

<br/>

![Built with](https://img.shields.io/badge/Built_with-Python_+_React-informational?style=flat-square)
![AI](https://img.shields.io/badge/AI-Llama_3.3_70B_via_Groq-F55036?style=flat-square)
![Data](https://img.shields.io/badge/Data-CelesTrak_+_Space--Track-0057FF?style=flat-square)

</div>
