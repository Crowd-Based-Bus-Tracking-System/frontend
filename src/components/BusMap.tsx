import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { BusRoute, Bus } from "@/data/routes";
import { socket } from "@/services/api";

interface BusMapProps {
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
  routes: BusRoute[];
  onSelectBus: (bus: Bus) => void;
}

function createBusIcon(color: string, isSelected: boolean) {
  return L.divIcon({
    className: "bus-icon",
    html: `<div style="
      width: ${isSelected ? 36 : 28}px;
      height: ${isSelected ? 36 : 28}px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3)${isSelected ? ", 0 0 20px " + color + "80" : ""};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    ">
      <svg width="${isSelected ? 18 : 14}" height="${isSelected ? 18 : 14}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
      </svg>
    </div>`,
    iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
    iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
  });
}

function createStopIcon(color: string) {
  return L.divIcon({
    className: "stop-icon",
    html: `<div style="
      width: 12px;
      height: 12px;
      background: white;
      border: 3px solid ${color};
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function MapController({ selectedRoute, selectedBus }: { selectedRoute: BusRoute | null; selectedBus: Bus | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedBus) {
      map.flyTo([selectedBus.lat, selectedBus.lng], 14, { duration: 1 });
    } else if (selectedRoute) {
      const bounds = L.latLngBounds(selectedRoute.stops.map((s) => [s.lat, s.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    } else {
      map.flyTo([7.8731, 80.7718], 8, { duration: 1 });
    }
  }, [selectedRoute, selectedBus, map]);

  return null;
}

export function BusMap({ selectedRoute, selectedBus, routes, onSelectBus }: BusMapProps) {
  const [liveBuses, setLiveBuses] = useState<{ [routeId: string]: Bus[] }>({});

  useEffect(() => {
    if (!selectedRoute) return;
    
    // Subscribe to specific route tracking
    const parsedRouteId = parseInt(selectedRoute.id.replace(/\D/g, ''));
    if (parsedRouteId) {
      socket.emit("subscribe:route", { routeId: parsedRouteId });
      
      const handleRouteBuses = (data: { routeId: number, buses: any[] }) => {
        if (data.routeId === parsedRouteId) {
          // Map backend simplified buses format back to frontend structural needs
          const mappedBuses = data.buses.map(b => ({
            id: `b${b.bus_id}`,
            plateNumber: b.plate_number,
            lat: b.current_location?.lat || 0,
            lng: b.current_location?.lng || 0,
            speed: b.speed || 0,
            heading: 0,
            status: b.status,
            lastUpdated: new Date().toISOString(),
            occupancy: "low",
            nextStop: b.next_stop_name || "Unknown",
            etaMinutes: b.eta_minutes || 0
          } as Bus));
          
          setLiveBuses(prev => ({ ...prev, [selectedRoute.id]: mappedBuses }));
        }
      };

      socket.on("route:buses", handleRouteBuses);

      return () => {
        socket.off("route:buses", handleRouteBuses);
        socket.emit("unsubscribe:route", { routeId: parsedRouteId });
      };
    }
  }, [selectedRoute?.id]);

  // Use live data if available, else static original array
  const activeBuses = selectedRoute ? (liveBuses[selectedRoute.id] || selectedRoute.buses) : [];

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapController selectedRoute={selectedRoute} selectedBus={selectedBus} />

      {selectedRoute && (
        <>
          {/* Route line */}
          <Polyline
            positions={selectedRoute.stops.map((s) => [s.lat, s.lng] as L.LatLngTuple)}
            pathOptions={{ color: selectedRoute.color, weight: 4, opacity: 0.7, dashArray: "8 8" }}
          />

          {/* Stops */}
          {selectedRoute.stops.map((stop) => (
            <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={createStopIcon(selectedRoute.color)}>
              <Popup className="custom-popup">
                <div className="text-xs font-semibold">{stop.name}</div>
              </Popup>
            </Marker>
          ))}

          {/* Buses */}
          {activeBuses.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={createBusIcon(selectedRoute.color, selectedBus?.id === bus.id)}
              eventHandlers={{ click: () => onSelectBus(bus) }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{bus.plateNumber}</p>
                  <p>Speed: {bus.speed} km/h</p>
                  <p>Next: {bus.nextStop}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      )}

      {/* Show all buses when no route selected */}
      {!selectedRoute &&
        routes.map((route) =>
          route.buses
            .filter((b) => b.status === "online")
            .map((bus) => (
              <Marker
                key={bus.id}
                position={[bus.lat, bus.lng]}
                icon={createBusIcon(route.color, false)}
              />
            ))
        )}
    </MapContainer>
  );
}
