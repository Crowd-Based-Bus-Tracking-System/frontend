export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  plateNumber: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: "online" | "offline" | "delayed";
  lastUpdated: string;
  occupancy: "empty" | "low" | "moderate" | "high" | "full";
  nextStop: string;
  nextStopEta?: number;
  etaMinutes: number;
  isSimulated?: boolean;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  from: string;
  to: string;
  stops: BusStop[];
  buses: Bus[];
  color: string;
  stopIdMapping?: number[];
}

export const sriLankaRoutes: BusRoute[] = [
  {
    id: "route-1",
    routeNumber: "138",
    name: "Colombo - Kandy",
    from: "Colombo Fort",
    to: "Kandy",
    color: "#0ea5a0",
    stopIdMapping: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Maps frontend indices to backend stop IDs
    stops: [
      { id: "s1", name: "Colombo Fort", lat: 6.9344, lng: 79.8428 },
      { id: "s2", name: "Kelaniya", lat: 6.9553, lng: 79.9217 },
      { id: "s3", name: "Kadawatha", lat: 7.0013, lng: 79.9530 },
      { id: "s4", name: "Nittambuwa", lat: 7.1442, lng: 80.0953 },
      { id: "s5", name: "Kegalle", lat: 7.2530, lng: 80.3464 },
      { id: "s6", name: "Mawanella", lat: 7.2425, lng: 80.4440 },
      { id: "s7", name: "Kadugannawa", lat: 7.2547, lng: 80.5243 },
      { id: "s8", name: "Peradeniya", lat: 7.2690, lng: 80.5942 },
      { id: "s9", name: "Kandy", lat: 7.2906, lng: 80.6337 },
    ],
    buses: [
      { id: "b1", plateNumber: "NB-1234", lat: 7.05, lng: 80.02, speed: 45, heading: 45, status: "online", lastUpdated: "2 min ago", occupancy: "moderate", nextStop: "Kadugannawa", etaMinutes: 25 },
      { id: "b2", plateNumber: "NC-5678", lat: 7.20, lng: 80.45, speed: 38, heading: 50, status: "online", lastUpdated: "1 min ago", occupancy: "full", nextStop: "Peradeniya", etaMinutes: 12 },
      { id: "b3", plateNumber: "WP-9012", lat: 6.95, lng: 79.88, speed: 0, heading: 0, status: "delayed", lastUpdated: "8 min ago", occupancy: "low", nextStop: "Kadawatha", etaMinutes: 40 },
    ],
  },
  {
    id: "route-2",
    routeNumber: "2",
    name: "Colombo - Galle",
    from: "Colombo Fort",
    to: "Galle",
    color: "#f59e0b",
    stopIdMapping: [10, 11, 12, 13, 14, 15, 16, 17, 18], // Maps frontend indices to backend stop IDs
    stops: [
      { id: "s6", name: "Colombo Fort", lat: 6.9344, lng: 79.8428 },
      { id: "s7", name: "Dehiwala", lat: 6.8528, lng: 79.8636 },
      { id: "s8", name: "Moratuwa", lat: 6.7730, lng: 79.8816 },
      { id: "s9", name: "Panadura", lat: 6.7136, lng: 79.9044 },
      { id: "s10", name: "Kalutara", lat: 6.5854, lng: 79.9607 },
      { id: "s11", name: "Bentota", lat: 6.4210, lng: 80.0004 },
      { id: "s12", name: "Ambalangoda", lat: 6.2352, lng: 80.0540 },
      { id: "s13", name: "Hikkaduwa", lat: 6.1390, lng: 80.1010 },
      { id: "s14", name: "Galle", lat: 6.0535, lng: 80.2210 },
    ],
    buses: [
      { id: "b4", plateNumber: "SP-3456", lat: 6.65, lng: 79.91, speed: 52, heading: 180, status: "online", lastUpdated: "1 min ago", occupancy: "low", nextStop: "Panadura", etaMinutes: 8 },
      { id: "b5", plateNumber: "SP-7890", lat: 6.30, lng: 80.03, speed: 40, heading: 185, status: "online", lastUpdated: "3 min ago", occupancy: "moderate", nextStop: "Ambalangoda", etaMinutes: 15 },
    ],
  },
  {
    id: "route-3",
    routeNumber: "4",
    name: "Colombo - Jaffna",
    from: "Colombo Fort",
    to: "Jaffna",
    color: "#8b5cf6",
    stopIdMapping: [19, 20, 21, 22, 23, 24, 25, 26], // Maps frontend indices to backend stop IDs (Colombo Fort=19, Kurunegala=20, Dambulla=21, etc.)
    stops: [
      { id: "s10", name: "Colombo Fort", lat: 6.9344, lng: 79.8428 }, // Backend ID 19
      { id: "s11", name: "Kurunegala", lat: 7.4863, lng: 80.3647 }, // Backend ID 20
      { id: "s12", name: "Dambulla", lat: 7.8742, lng: 80.6511 }, // Backend ID 21
      { id: "s13", name: "Anuradhapura", lat: 8.3114, lng: 80.4037 }, // Backend ID 22
      { id: "s14", name: "Vavuniya", lat: 8.7514, lng: 80.4997 }, // Backend ID 23
      { id: "s15", name: "Kilinochchi", lat: 9.3803, lng: 80.4036 }, // Backend ID 24
      { id: "s16", name: "Elephant Pass", lat: 9.5697, lng: 80.3800 }, // Backend ID 25
      { id: "s17", name: "Jaffna", lat: 9.6615, lng: 80.0255 }, // Backend ID 26
    ],
    buses: [
      { id: "b6", plateNumber: "NP-1111", lat: 8.0, lng: 80.50, speed: 60, heading: 0, status: "online", lastUpdated: "1 min ago", occupancy: "low", nextStop: "Anuradhapura", etaMinutes: 35 },
      { id: "b7", plateNumber: "NP-2222", lat: 9.10, lng: 80.40, speed: 55, heading: 350, status: "online", lastUpdated: "2 min ago", occupancy: "moderate", nextStop: "Kilinochchi", etaMinutes: 20 },
    ],
  },
  {
    id: "route-4",
    routeNumber: "99",
    name: "Colombo - Matara",
    from: "Colombo Fort",
    to: "Matara",
    color: "#ec4899",
    stopIdMapping: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36], // Maps frontend indices to backend stop IDs
    stops: [
      { id: "s18", name: "Colombo Fort", lat: 6.9344, lng: 79.8428 },
      { id: "s19", name: "Mount Lavinia", lat: 6.8391, lng: 79.8656 },
      { id: "s20", name: "Moratuwa", lat: 6.7730, lng: 79.8816 },
      { id: "s21", name: "Panadura", lat: 6.7136, lng: 79.9044 },
      { id: "s22", name: "Kalutara", lat: 6.5854, lng: 79.9607 },
      { id: "s23", name: "Aluthgama", lat: 6.4342, lng: 80.0024 },
      { id: "s24", name: "Ambalangoda", lat: 6.2352, lng: 80.0540 },
      { id: "s25", name: "Galle", lat: 6.0535, lng: 80.2210 },
      { id: "s26", name: "Weligama", lat: 5.9741, lng: 80.4296 },
      { id: "s27", name: "Matara", lat: 5.9549, lng: 80.5550 },
    ],
    buses: [
      { id: "b8", plateNumber: "SG-4444", lat: 6.10, lng: 80.18, speed: 48, heading: 170, status: "online", lastUpdated: "1 min ago", occupancy: "full", nextStop: "Galle", etaMinutes: 10 },
    ],
  },
  {
    id: "route-5",
    routeNumber: "48",
    name: "Kandy - Nuwara Eliya",
    from: "Kandy",
    to: "Nuwara Eliya",
    color: "#10b981",
    stopIdMapping: [37, 38, 39, 40], // Maps frontend indices to backend stop IDs
    stops: [
      { id: "s28", name: "Kandy", lat: 7.2906, lng: 80.6337 },
      { id: "s29", name: "Gampola", lat: 7.1642, lng: 80.5767 },
      { id: "s30", name: "Nawalapitiya", lat: 7.0489, lng: 80.5345 },
      { id: "s31", name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
    ],
    buses: [
      { id: "b9", plateNumber: "CP-5555", lat: 7.10, lng: 80.56, speed: 30, heading: 200, status: "online", lastUpdated: "2 min ago", occupancy: "low", nextStop: "Nawalapitiya", etaMinutes: 18 },
      { id: "b10", plateNumber: "CP-6666", lat: 7.00, lng: 80.65, speed: 25, heading: 210, status: "delayed", lastUpdated: "10 min ago", occupancy: "moderate", nextStop: "Nuwara Eliya", etaMinutes: 30 },
    ],
  },
];
