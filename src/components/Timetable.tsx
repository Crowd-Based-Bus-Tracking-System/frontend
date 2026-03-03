import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Zap, ChevronDown } from "lucide-react";
import { BusRoute } from "@/data/routes";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchTimetable } from "@/services/api";

interface TimetableProps {
  route: BusRoute;
}

const busTypeStyles: Record<string, { label: string; className: string }> = {
  express: { label: "Express", className: "bg-primary/15 text-primary" },
  normal: { label: "Normal", className: "bg-muted text-muted-foreground" },
  "semi-luxury": { label: "Semi-Lux", className: "bg-accent/15 text-accent" },
};

export function Timetable({ route }: TimetableProps) {
  const [day, setDay] = useState<"weekday" | "weekend">("weekday");
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const { data: timetable, isLoading } = useQuery({
    queryKey: ["timetable", route.id],
    queryFn: () => fetchTimetable(route.id),
    enabled: !!route.id,
  });

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading schedules...</p>
      </div>
    );
  }

  if (!timetable || (timetable.weekday.length === 0 && timetable.weekend.length === 0)) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No timetable available for this route.
      </div>
    );
  }

  const entries = day === "weekday" ? timetable.weekday : timetable.weekend;

  return (
    <div className="space-y-3">
      {/* Day toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
        {(["weekday", "weekend"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              day === d
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />
            {d === "weekday" ? "Weekdays" : "Weekends"}
          </button>
        ))}
      </div>

      {/* Timetable entries */}
      <div className="space-y-1.5">
        {entries.map((entry, i) => (
          <motion.div
            key={`${entry.departureTime}-${i}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-lg bg-card border border-border/50 transition-colors overflow-hidden"
          >
            <div 
              className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpandedTripId(expandedTripId === entry.tripId ? null : entry.tripId)}
            >
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground tabular-nums">{entry.departureTime}</p>
                <p className="text-[10px] text-muted-foreground">DEP</p>
              </div>
              <div className="text-muted-foreground text-[10px]">→</div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground tabular-nums">{entry.arrivalTime}</p>
                <p className="text-[10px] text-muted-foreground">ARR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${busTypeStyles[entry.busType].className}`}>
                {busTypeStyles[entry.busType].label}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                 <Zap className="w-3 h-3 text-yellow-500" />
                 Bus: {route.buses.find(b => b.id === entry.busId)?.plateNumber || entry.busId}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-2 ${expandedTripId === entry.tripId ? 'rotate-180' : ''}`} />
            </div>
            </div>
            
            <AnimatePresence>
              {expandedTripId === entry.tripId && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-muted/20 border-t border-border/50"
                  style={{ overflow: "hidden" }}
                >
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Stop Schedule</p>
                    <div className="space-y-1.5">
                      {entry.stopSchedules.map((stop, sIdx) => {
                        const stopDetails = route.stops.find(s => s.id === stop.stopId);
                        return (
                          <div key={stop.stopId} className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                              <span className="text-foreground/80">{stopDetails?.name || stop.stopId}</span>
                            </span>
                            <span className="tabular-nums font-medium">{stop.arrivalTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
