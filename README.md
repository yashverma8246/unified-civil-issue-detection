# Unified Civic Issue Detection Platform

## Problem Statement

Civic issue reporting is currently fragmented, manual, and often opaque. Citizens struggle to report problems like potholes or garbage dumps, and authorities lack real-time visibility into these issues, leading to delayed resolution and lack of accountability.

## Solution Overview

This platform provides a unified, AI-powered interface for citizens to report issues and for authorities to track them.

- **For Citizens**: A simple web app to upload photos, which are automatically classified and geo-tagged.
- **For Authorities**: A real-time dashboard to monitor reported issues, track status, and analyze performance.

## Key Features & Innovation

- **AI-Powered Classification**: (Frontend Ready) Placeholder for automatic image recognition to categorize issues (e.g., Pothole, Sanitation).
- **Unified Workflow**: Seamless flow from citizen report -> department routing -> field resolution.
- **Transparency**: Public tracking of issue status to build trust.
- **Analytics**: Admin dashboard for KPIs and city-wide health monitoring.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router v7
- **HTTP Client**: Axios

## Project Structure

```
src/
 ├── app/           # App-wide routing and layout
 ├── components/    # Reusable UI components (Button, Card, etc.)
 ├── features/      # Feature-specific logic (future expansion)
 ├── pages/         # Page components (Landing, Report, Dashboard)
 ├── services/      # API services
 ├── store/         # Global state (Zustand)
 ├── types/         # TypeScript interfaces
 └── utils/         # Helper functions
```

## How to Run Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Future Roadmap

- **Integration**: Connect to a real Backend API.
- **AI Model**: Integrate TensorFlow.js or an external API for image classification.
- **GIS**: Integrate Google Maps or Mapbox for interactive map views.
- **IoT**: Connect with smart city sensors for automatic detection.
