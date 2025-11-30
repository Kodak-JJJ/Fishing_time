# Fishing Time 🌊🎣

A web app that helps anglers check real-time and tidal water levels for my favourite fishing spots in BC.

## Features

- Interactive map with clickable pins (Leaflet)
  - Blue pins: tidal stations (IWLS)
  - Green pins: river stations (GeoMet hydrometric)
- Detail page for each spot:
  - Date range selector
  - Real-time water level chart (Chart.js)
  - Scrollable data table with timestamps
- Supports:
  - Water level **observations**
  - Water level **predictions** (tidal)

## Tech Stack

- **Backend:** Node.js, Express, EJS
- **Frontend:** Leaflet, Chart.js, vanilla JS
- **Data sources:**
  - GeoMet Hydrometric API (Environment Canada)
  - IWLS API (Canadian Hydrographic Service)
- **Database:** MySQL (for storing station locations)
- **Other:** date-fns (via Chart.js adapter), CSS layout, ES modules

## Running Publically on Railway

https://fishingtime-production.up.railway.app/home_page
