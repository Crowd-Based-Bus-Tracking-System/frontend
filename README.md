# Trowd Frontend 🗺️

The client-facing web application for Trowd, designed to give commuters real-time, GPS-free bus tracking and accurate arrival estimates through a sleek, interactive map interface.

## 🛠 Tech Stack
- **Framework**: React 18, built with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Maps**: Leaflet (`react-leaflet`)
- **State & Data Fetching**: React Query, React Hook Form
- **Real-Time**: Socket.io-client

## ✨ Features
- **Live Map Interface**: View routes, stops, and estimated bus locations using Leaflet.
- **Real-Time ETAs**: Receive instant ETA updates and delay notifications via WebSockets.
- **Crowdsourcing Hub**: Easily report bus arrivals to improve system accuracy for everyone.
- **Responsive Design**: Mobile-first architecture ensures a smooth experience on the go.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file (refer to `.env.production` for required keys) to point to your backend API and WebSocket endpoints.

### Development Server
Run the local development server with Vite:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
The compiled assets will be available in the `/dist` directory.
