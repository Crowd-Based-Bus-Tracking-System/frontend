import { io } from "socket.io-client";

export const API_BASE_URL = "http://localhost:3000/api";
export const SOCKET_URL = "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
});

export async function fetchRoutes() {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) {
        throw new Error("Failed to fetch routes");
    }
    return response.json();
}

export async function fetchTimetable(routeId: string) {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/timetable`);
    if (!response.ok) {
        throw new Error("Failed to fetch timetable");
    }
    return response.json();
}

export async function predictETA(routeId: number, busId: number, targetStopId: number, location?: { lat: number; lng: number }) {
    const response = await fetch(`${API_BASE_URL}/eta/predict-eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bus: { busId, routeId },
            targetStopId,
            location
        })
    });
    if (!response.ok) throw new Error("Failed to predict ETA");
    return response.json();
}

export async function reportArrival(routeId: number, busId: number, stopId: number, arrivalTime: number, userId: string = "browser-client") {
    const response = await fetch(`${API_BASE_URL}/arrival/report-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bus: { busId, routeId },
            stopId,
            arrivalTime,
            user: { id: userId, lat: 0, lng: 0 }
        })
    });
    if (!response.ok) throw new Error("Failed to report arrival");
    return response.json();
}
