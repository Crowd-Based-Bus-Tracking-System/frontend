import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useQuery } from "@tanstack/react-query";
import { predictETA } from "@/services/api";

interface ETACountdownProps {
  route: BusRoute;
  bus: Bus;
}

export function ETACountdown({ route, bus }: ETACountdownProps) {
  const nextStopIndex = route.stops.findIndex((s) => s.name === bus.nextStop);
  const targetStopId = route.stops[nextStopIndex]?.id ? parseInt(route.stops[nextStopIndex].id.replace(/\D/g, '')) : undefined;
  
  const { data: etaPrediction, isLoading } = useQuery({
    queryKey: ["eta", route.id, bus.id, targetStopId],
    queryFn: async () => {
      const parsedRouteId = parseInt(route.id.replace(/\D/g, ''));
      const parsedBusId = parseInt(bus.id.replace(/\D/g, ''));
      if (!parsedRouteId || !parsedBusId || !targetStopId) return null;
      return predictETA(parsedRouteId, parsedBusId, targetStopId);
    },
    enabled: !!route.id && !!bus.id && !!targetStopId,
    refetchInterval: 30000 // Poll every 30 seconds as fallback to sockets
  });

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // If we have a fresh ML prediction, set it. Otherwise fallback to static bus.etaMinutes
    if (etaPrediction?.data?.finalEtaMinutes) {
        setSeconds(etaPrediction.data.finalEtaMinutes * 60);
    } else {
        setSeconds(bus.etaMinutes * 60);
    }
  }, [etaPrediction, bus.etaMinutes, bus.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // Base progress on 60 minutes max if we don't have historical context
  const maxSeconds = (etaPrediction?.data?.mlPrediction?.baseEtaMinutes || bus.etaMinutes || 60) * 60;
  const progress = 1 - Math.min(seconds / maxSeconds, 1);

  return (
    <div className="space-y-3">
      {/* Big countdown */}
      <div className="relative p-4 rounded-xl bg-muted/50 border border-border/50 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-primary/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.5 }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Arriving at {bus.nextStop}</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {String(mins).padStart(2, "0")}
            </span>
            <span className="text-lg text-muted-foreground animate-pulse">:</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Stop-by-stop ETA */}
      <div className="space-y-0">
        {route.stops.map((stop, i) => {
          const isPassed = nextStopIndex > 0 && i < nextStopIndex;
          const isNext = i === nextStopIndex;
          const isFuture = i > nextStopIndex;
          const futureETA = isFuture && nextStopIndex >= 0 
            ? mins + (i - nextStopIndex) * 8 
            : null;

          return (
            <div key={stop.id} className="flex items-center gap-3 py-1.5">
              <div className="flex flex-col items-center w-4">
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isPassed
                      ? "bg-primary border-primary"
                      : isNext
                      ? "bg-accent border-accent"
                      : "bg-transparent border-border"
                  }`}
                  animate={isNext ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {i < route.stops.length - 1 && (
                  <div
                    className={`w-0.5 h-5 ${isPassed ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span
                  className={`text-xs ${
                    isPassed
                      ? "text-muted-foreground line-through"
                      : isNext
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {stop.name}
                  {isNext && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                      NEXT
                    </span>
                  )}
                </span>
                {isNext && (
                  <span className="text-xs font-bold text-accent tabular-nums">{mins}m</span>
                )}
                {futureETA !== null && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">~{futureETA}m</span>
                )}
                {isPassed && (
                  <MapPin className="w-3 h-3 text-primary" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
