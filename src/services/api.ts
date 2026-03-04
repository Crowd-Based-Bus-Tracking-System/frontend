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

export async function fetchRouteBuses(routeId: number, targetStopId: number) {
    const response = await fetch(`${API_BASE_URL}/eta/route/${routeId}/buses?targetStopId=${targetStopId}`);
    if (!response.ok) throw new Error("Failed to fetch route buses");
    return response.json();
}

export async function reportArrival(
    routeId: number,
    busId: number,
    stopId: number,
    arrivalTime: number,
    userLat: number,
    userLng: number,
    userId: string | number = "browser-client"
) {
    const response = await fetch(`${API_BASE_URL}/arrival/report-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bus: { busId, routeId },
            stopId,
            arrivalTime,
            user: { id: String(userId), lat: userLat, lng: userLng }
        })
    });
    if (!response.ok) throw new Error("Failed to report arrival");
    return response.json();
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to login");
    return data;
}

export async function register(email: string, password: string, username: string) {
    // Generate a random device identifier natively since the user is a browser client
    const syntheticDeviceId = `web-${Math.random().toString(36).substring(2, 15)}`;

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            username,
            role: "user",
            device_id: syntheticDeviceId
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to register");
    return data;
}

export async function fetchRecentReports(busId: string | number) {
    const response = await fetch(`${API_BASE_URL}/arrival/reports/${busId}`);
    if (!response.ok) throw new Error("Failed to fetch reports");
    return response.json();
}

export async function upvoteReport(reportId: string, routeId: string | number) {
    const response = await fetch(`${API_BASE_URL}/arrival/${reportId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId })
    });
    if (!response.ok) throw new Error("Failed to upvote report");
    return response.json();
}
