import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, MapPin, Search, ChevronRight, Users, Clock, Zap, Calendar, Flag } from "lucide-react";
import { BusRoute, Bus as BusType } from "@/data/routes";
import { ETACountdown } from "./ETACountdown";
import { ArrivalReport } from "./ArrivalReport";
import { OccupancyReport } from "./OccupancyReport";
import { Timetable } from "./Timetable";

interface RoutePanelProps {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  selectedBus: BusType | null;
  activeBuses?: BusType[];
  onSelectRoute: (route: BusRoute) => void;
  onSelectBus: (bus: BusType) => void;
  onBack: () => void;
}

const occupancyColors = {
  low: "bg-bus-online",
  medium: "bg-accent",
  high: "bg-destructive",
};

const occupancyLabels = {
  low: "Low",
  medium: "Medium",
  high: "Full",
};

type RouteTab = "stops" | "timetable";
type BusTab = "tracking" | "report" | "occupancy";

export function RoutePanel({ routes, selectedRoute, selectedBus, activeBuses = [], onSelectRoute, onSelectBus, onBack }: RoutePanelProps) {
  const [search, setSearch] = useState("");
  const [routeTab, setRouteTab] = useState<RouteTab>("stops");
  const [busTab, setBusTab] = useState<BusTab>("tracking");

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.routeNumber.includes(search)
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bus className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">Sri Lanka Transit</h1>
            <p className="text-[10px] text-muted-foreground">Live Bus Tracking</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedRoute ? (
            /* Route List */
            <motion.div
              key="routes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-3 space-y-2"
            >
              <p className="text-xs text-muted-foreground px-1 mb-2">
                {filtered.length} routes available
              </p>
              {filtered.map((route, i) => (
                <motion.button
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { onSelectRoute(route); setRouteTab("stops"); }}
                  className="w-full p-3 rounded-xl bg-card hover:bg-muted/80 border border-border/50 text-left transition-all hover:scale-[1.02] hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
                        style={{ backgroundColor: route.color }}
                      >
                        {route.routeNumber}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{route.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{route.from} → {route.to}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {route.buses.filter(b => (b as any).hasConfirmedStop).length} live
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : !selectedBus ? (
            /* Route Detail with Tabs */
            <motion.div
              key="buses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3"
            >
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-xs text-primary hover:underline mb-3"
              >
                ← All Routes
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
                  style={{ backgroundColor: selectedRoute.color }}
                >
                  {selectedRoute.routeNumber}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedRoute.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedRoute.buses.length} buses on this route</p>
                </div>
              </div>

              {/* Route tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-muted/50 mb-3">
                <button
                  onClick={() => setRouteTab("stops")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    routeTab === "stops" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <MapPin className="w-3 h-3" /> Stops & Buses
                </button>
                <button
                  onClick={() => setRouteTab("timetable")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    routeTab === "timetable" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="w-3 h-3" /> Timetable
                </button>
              </div>

              <AnimatePresence mode="wait">
                {routeTab === "stops" ? (
                  <motion.div key="stops-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Stops */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">STOPS</p>
                      <div className="space-y-0">
                        {selectedRoute.stops.map((stop, i) => (
                          <div key={stop.id} className="flex items-center gap-2 py-1.5 px-1">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-2.5 h-2.5 rounded-full border-2"
                                style={{ borderColor: selectedRoute.color, backgroundColor: i === 0 || i === selectedRoute.stops.length - 1 ? selectedRoute.color : "transparent" }}
                              />
                              {i < selectedRoute.stops.length - 1 && (
                                <div className="w-0.5 h-4" style={{ backgroundColor: selectedRoute.color, opacity: 0.3 }} />
                              )}
                            </div>
                            <span className="text-xs text-foreground">{stop.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buses */}
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-1">LIVE BUSES</p>
                    <div className="space-y-2">
                      {activeBuses.map((bus, i) => (
                        <motion.button
                          key={bus.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => { onSelectBus(bus); setBusTab("tracking"); }}
                          className="w-full p-3 rounded-xl bg-card hover:bg-muted/80 border border-border/50 text-left transition-all hover:scale-[1.02] hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bus className="w-4 h-4 text-accent" />
                              <span className="text-sm font-semibold text-foreground">{bus.plateNumber}</span>
                            </div>
                            <span className={`w-2 h-2 rounded-full ${bus.status === "online" ? "bg-bus-online bus-marker-pulse" : bus.status === "delayed" ? "bg-accent" : "bg-bus-offline"}`} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                               <Clock className="w-3 h-3" /> 
                               {bus.nextStopEta && bus.nextStopEta > 0 ? `Next: ${bus.nextStop} in ${bus.nextStopEta}m` : `ETA ${bus.etaMinutes}m`}
                            </span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {bus.speed} km/h</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className={`w-1.5 h-1.5 rounded-full ${occupancyColors[bus.occupancy]}`} />
                              {occupancyLabels[bus.occupancy]}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="timetable-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Timetable route={selectedRoute} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Bus Detail with Tabs */
            <motion.div
              key="bus-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3"
            >
              <button
                onClick={() => onSelectBus(null as any)}
                className="flex items-center gap-1 text-xs text-primary hover:underline mb-3"
              >
                ← Back to buses
              </button>
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-3"
                >
                  <Bus className="w-8 h-8 text-accent" />
                </motion.div>
                <h2 className="text-lg font-bold text-foreground">{selectedBus.plateNumber}</h2>
               <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mt-1 ${
                  selectedBus.status === "online" ? "bg-bus-online/20 text-bus-online" : 
                  selectedBus.status === "offline" ? "bg-bus-offline/20 text-bus-offline" : "bg-accent/20 text-accent"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedBus.status === "online" ? "bg-bus-online" : selectedBus.status === "offline" ? "bg-bus-offline" : "bg-accent"}`} />
                  {selectedBus.status === "online" ? "Live" : selectedBus.status === "offline" ? "Scheduled" : "Delayed"}
                </span>
              </div>

              {/* Bus tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-muted/50 mb-3">
                <button
                  onClick={() => setBusTab("tracking")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    busTab === "tracking" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Clock className="w-3 h-3" /> ETA
                </button>
                <button
                  onClick={() => setBusTab("occupancy")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    busTab === "occupancy" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Users className="w-3 h-3" /> Occupancy
                </button>
                <button
                  onClick={() => setBusTab("report")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    busTab === "report" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Flag className="w-3 h-3" /> Arrival
                </button>
              </div>

              <AnimatePresence mode="wait">
                {busTab === "tracking" ? (
                  <motion.div key="tracking-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ETACountdown route={selectedRoute} bus={selectedBus} />

                    <div className="space-y-3 mt-4">
                      <DetailRow icon={<Zap className="w-4 h-4" />} label="Speed" value={`${selectedBus.speed} km/h`} />
                      <DetailRow icon={<Clock className="w-4 h-4" />} label="Last Update" value={selectedBus.lastUpdated} />
                    </div>
                  </motion.div>
                ) : busTab === "occupancy" ? (
                  <motion.div key="occupancy-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <OccupancyReport route={selectedRoute} bus={selectedBus} />
                  </motion.div>
                ) : (
                  <motion.div key="report-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ArrivalReport route={selectedRoute} bus={selectedBus} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
