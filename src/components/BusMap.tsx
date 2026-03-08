import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { BusRoute, Bus } from "@/data/routes";
import { socket, fetchRouteBuses } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

interface BusMapProps {
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
  routes: BusRoute[];
  onSelectBus: (bus: Bus) => void;
  onSelectStop?: (stopId: number) => void;
  activeBuses: Bus[];
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
    className: "stop-icon-wrapper",
    html: `<div style="
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Invisible touch target */
      background: transparent;
      border-radius: 50%;
    "><div style="
      width: 12px;
      height: 12px;
      background: white;
      border: 3px solid ${color};
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    "></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapController({
  selectedRoute,
  selectedBus,
}: {
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedBus) {
      map.flyTo([selectedBus.lat, selectedBus.lng], 14, { duration: 1 });
    } else if (selectedRoute) {
      const bounds = L.latLngBounds(
        selectedRoute.stops.map((s) => [s.lat, s.lng]),
      );
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    } else {
      map.flyTo([7.8731, 80.7718], 8, { duration: 1 });
    }
  }, [selectedRoute, selectedBus, map]);

  return null;
}

export function BusMap({
  selectedRoute,
  selectedBus,
  routes,
  onSelectBus,
  onSelectStop,
  activeBuses,
}: BusMapProps) {
  const [selectedMapStopId, setSelectedMapStopId] = useState<
    number | undefined
  >(undefined);
  const closingForBusSelection = useRef(false);

  const { data: stopETAs, isLoading: isStopETAsLoading } = useQuery({
    queryKey: ["stopETAs", selectedRoute?.id, selectedMapStopId],
    queryFn: async () => {
      const parsedRouteId = parseInt(selectedRoute!.id.replace(/\D/g, ""));
      if (!parsedRouteId || !selectedMapStopId) return null;
      
      const selectedStopNode = selectedRoute!.stops.find(s => parseInt(s.id.replace(/\D/g, "")) === selectedMapStopId);
      if (!selectedStopNode) return null;
      const indexInStopsArray = selectedRoute!.stops.indexOf(selectedStopNode);
      const backendTargetStopId = selectedRoute!.stopIdMapping?.[indexInStopsArray];

      if (!backendTargetStopId) return null;

      return fetchRouteBuses(parsedRouteId, backendTargetStopId);
    },
    enabled: !!selectedRoute && !!selectedMapStopId,
    refetchInterval: 5000,
  });

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
            positions={selectedRoute.stops.map(
              (s) => [s.lat, s.lng] as L.LatLngTuple,
            )}
            pathOptions={{
              color: selectedRoute.color,
              weight: 4,
              opacity: 0.7,
              dashArray: "8 8",
            }}
          />

          {/* Stops */}
          {selectedRoute.stops.map((stop) => {
            const parsedStopId = parseInt(stop.id.replace(/\D/g, ""));
            const isSelected = selectedMapStopId === parsedStopId;

            return (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={createStopIcon(selectedRoute.color)}
                zIndexOffset={1000}
                eventHandlers={{
                  click: () => {
                    closingForBusSelection.current = false;
                    setSelectedMapStopId(parsedStopId);
                  },
                }}
              >
                <Popup
                  className="custom-popup"
                  eventHandlers={{
                    remove: () => {
                      if (isSelected && !closingForBusSelection.current) {
                        setSelectedMapStopId(undefined);
                      }
                    },
                  }}
                >
                  <div className="min-w-[140px]">
                    <div className="text-xs font-semibold mb-2">
                      {stop.name}
                    </div>

                    {isSelected && (
                      <div className="flex flex-col gap-1.5 mt-2 max-h-[160px] overflow-y-auto">
                        <div className="text-[10px] uppercase text-muted-foreground font-semibold px-1 tracking-wider border-b border-border pb-1">
                          Approaching Buses
                        </div>
                        {isStopETAsLoading ? (
                          <div className="text-[10px] text-muted-foreground animate-pulse text-center py-2">
                            Loading ETAs...
                          </div>
                        ) : stopETAs.data.buses.length > 0 ? (
                          stopETAs.data.buses
                            .filter((b: any) => {
                              const backendStopId =
                                selectedRoute.stopIdMapping?.[
                                  selectedRoute.stops.findIndex(
                                    (s) => s.id === stop.id,
                                  )
                                ];

                              if (!b.lastConfirmedStop) return true;

                              const routeEtaItem = b.eta?.route_etas?.find(
                                (s: any) => s.stop_id === backendStopId,
                              );

                              if (!routeEtaItem) return false;
                              return routeEtaItem.is_passed !== true;
                            })
                            .map((b: any) => {
                              const backendStopId =
                                selectedRoute.stopIdMapping?.[
                                  selectedRoute.stops.findIndex(
                                    (s) => s.id === stop.id,
                                  )
                                ];

                              let etaMinutes: number | null = null;

                              if (b.lastConfirmedStop) {
                                const routeEtaItem = b.eta?.route_etas?.find(
                                  (s: any) => s.stop_id === backendStopId,
                                );

                                if (routeEtaItem?.arrival_time) {
                                  const arrivalTimeMillis = typeof routeEtaItem.arrival_time === "number" 
                                    ? routeEtaItem.arrival_time 
                                    : new Date(routeEtaItem.arrival_time).getTime();
                                  
                                  const secondsRemaining = Math.max(0, Math.floor((arrivalTimeMillis - Date.now()) / 1000));
                                  etaMinutes = Math.floor(secondsRemaining / 60);
                                } else {
                                  etaMinutes = routeEtaItem?.eta_minutes ?? null;
                                }
                              } else {
                                etaMinutes =
                                  b.eta?.eta_minutes ??
                                  (b.eta?.eta_seconds
                                    ? Math.floor(Math.max(0, b.eta.eta_seconds) / 60)
                                    : null);
                              }

                              return { b, etaMinutes };
                            })
                            .sort((a: any, b: any) => {
                              if (a.etaMinutes === null && b.etaMinutes === null) return 0;
                              if (a.etaMinutes === null) return 1;
                              if (b.etaMinutes === null) return -1;
                              return a.etaMinutes - b.etaMinutes;
                            })
                            .map(({ b, etaMinutes }: any) => {
                              const matchingBus = activeBuses.find(
                                (ab) =>
                                  parseInt(ab.id.replace(/\D/g, "")) ===
                                  b.busId,
                              );
                              return (
                                <div
                                  key={b.busId}
                                  className="flex justify-between items-center text-[10px] bg-muted/30 hover:bg-muted/50 transition-colors p-1.5 rounded-md cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (matchingBus) {
                                      closingForBusSelection.current = true;
                                      onSelectBus(matchingBus);
                                      const backendStopId =
                                        selectedRoute.stopIdMapping?.[
                                          selectedRoute.stops.findIndex(
                                            (s) => s.id === stop.id,
                                          )
                                        ];
                                      if (onSelectStop && backendStopId)
                                        onSelectStop(backendStopId);
                                    }
                                  }}
                                >
                                  <span className="font-medium whitespace-nowrap">
                                    Bus {b.busNumber}
                                  </span>
                                  <span
                                    className={`font-bold ${etaMinutes === 0 ? "text-green-500" : "text-primary"}`}
                                  >
                                    {etaMinutes === 0
                                      ? "Arrived"
                                      : etaMinutes >= 1440
                                        ? `${Math.floor(etaMinutes / 1440)}d ${Math.floor((etaMinutes % 1440) / 60)}h`
                                        : etaMinutes >= 60
                                          ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`
                                          : `${etaMinutes}m`}
                                  </span>
                                </div>
                              );
                            })
                        ) : (
                          <div className="text-[10px] text-muted-foreground text-center py-2">
                            No buses active
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Buses */}
          {activeBuses.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={createBusIcon(
                selectedRoute.color,
                selectedBus?.id === bus.id,
              )}
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
            )),
        )}
    </MapContainer>
  );
}
