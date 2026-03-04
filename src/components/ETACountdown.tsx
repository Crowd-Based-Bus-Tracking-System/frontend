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
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // If user hasn't selected a stop, default to the immediate next stop
  const effectiveTargetIndex = selectedStopIndex !== null ? selectedStopIndex : nextStopIndex;
  
  const targetStopId = route.stops[effectiveTargetIndex]?.id 
    ? parseInt(route.stops[effectiveTargetIndex].id.replace(/\D/g, '')) 
    : undefined;
  
  const { data: etaPrediction, isLoading } = useQuery({
    queryKey: ["eta", route.id, bus.id, targetStopId],
    queryFn: async () => {
      const parsedRouteId = parseInt(route.id.replace(/\D/g, ''));
      const parsedBusId = parseInt(bus.id.replace(/\D/g, ''));
      if (!parsedRouteId || !parsedBusId || !targetStopId) return null;
      return predictETA(parsedRouteId, parsedBusId, targetStopId);
    },
    enabled: !!route.id && !!bus.id && !!targetStopId
  });

  const [seconds, setSeconds] = useState(0);
  const [zeroReachedAt, setZeroReachedAt] = useState<number | null>(null);

  useEffect(() => {
    // If we have a fresh ML prediction, set it. Otherwise fallback to static bus.etaMinutes if it's the next stop
    if (etaPrediction?.data?.eta_minutes !== undefined) {
        setSeconds(Math.max(0, etaPrediction.data.eta_minutes * 60));
    } else if (effectiveTargetIndex === nextStopIndex) {
        setSeconds(Math.max(0, bus.etaMinutes * 60));
    } else {
        // Fallback for future stops if ML prediction is not ready yet
        const offsetStops = effectiveTargetIndex - nextStopIndex;
        setSeconds((bus.etaMinutes + offsetStops * 8) * 60);
    }
  }, [etaPrediction, bus.etaMinutes, bus.id, effectiveTargetIndex, nextStopIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const maxSeconds = (etaPrediction?.data?.eta_minutes || bus.etaMinutes || 60) * 60;

  useEffect(() => {
    if (seconds === 0 && maxSeconds > 0) {
      if (!zeroReachedAt) {
        setZeroReachedAt(Date.now());
      } else {
        // Dynamic wait threshold: 5% of max ETA, bounded between 15s and 90s
        const waitThresholdMs = Math.min(90000, Math.max(15000, maxSeconds * 0.05 * 1000));
        
        if (Date.now() - zeroReachedAt > waitThresholdMs) {
          if (effectiveTargetIndex < route.stops.length - 1) {
            setSelectedStopIndex(effectiveTargetIndex + 1);
            setZeroReachedAt(null);
          }
        }
      }
    } else {
      setZeroReachedAt(null);
    }
  }, [seconds, zeroReachedAt, maxSeconds, effectiveTargetIndex, route.stops.length]);

  const days = Math.floor(seconds / (24 * 3600));
  const hrs = Math.floor((seconds % (24 * 3600)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const totalMins = Math.floor(seconds / 60);

  // Base progress on 60 minutes max if we don't have historical context
  const progress = 1 - Math.min(seconds / maxSeconds, 1);

  const formatCompactTime = (totalMinutes: number) => {
    if (totalMinutes >= 1440) return `${Math.floor(totalMinutes / 1440)}d ${Math.floor((totalMinutes % 1440) / 60)}h`;
    if (totalMinutes >= 60) return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    return `${totalMinutes}m`;
  };

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
            <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin text-muted-foreground' : 'text-primary'}`} />
            <span className="text-xs text-muted-foreground">
              Arriving at {route.stops[effectiveTargetIndex]?.name}
            </span>
          </div>
          <div className="flex items-baseline gap-0.5">
            {days > 0 ? (
              <>
                <span className="text-2xl font-bold text-foreground tabular-nums">{days}</span>
                <span className="text-sm font-medium text-muted-foreground mr-1">d</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{hrs}</span>
                <span className="text-sm font-medium text-muted-foreground">h</span>
              </>
            ) : hrs > 0 ? (
              <>
                <span className="text-2xl font-bold text-foreground tabular-nums">{hrs}</span>
                <span className="text-sm font-medium text-muted-foreground mr-1">h</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{mins}</span>
                <span className="text-sm font-medium text-muted-foreground">m</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {String(mins).padStart(2, "0")}
                </span>
                <span className="text-lg text-muted-foreground animate-pulse">:</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {String(secs).padStart(2, "0")}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Speed indicator */}
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/80 border border-border/30">
                <span className="text-xs font-semibold text-foreground">Speed</span>
             </div>
             <div className="text-sm font-bold text-primary mr-1">{bus.speed} km/h</div>
        </div>
      </div>

      {/* Stop-by-stop ETA */}
      <div className="space-y-0">
        {route.stops.map((stop, i) => {
          const isPassed = nextStopIndex > 0 && i < nextStopIndex;
          const isNext = i === nextStopIndex;
          const isFuture = i > nextStopIndex;
          const isSelected = i === effectiveTargetIndex;
          
          // Only show approximation if this isn't the currently selected target
          const futureETA = isFuture && !isSelected && nextStopIndex >= 0 
            ? totalMins + (i - effectiveTargetIndex) * 8 
            : null;

          return (
            <div 
              key={stop.id} 
              className={`flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-md transition-colors ${
                isSelected ? 'bg-primary/5' : ''
              } ${isFuture ? 'cursor-pointer hover:bg-muted' : ''}`}
              onClick={() => {
                if (isFuture || isNext) setSelectedStopIndex(i);
              }}
            >
              <div className="flex flex-col items-center w-4">
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isPassed
                      ? "bg-primary border-primary"
                      : isSelected
                      ? "bg-primary border-primary"
                      : isNext
                      ? "bg-accent border-accent"
                      : "bg-transparent border-border"
                  }`}
                  animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {i < route.stops.length - 1 && (
                  <div
                    className={`w-0.5 h-5 ${isPassed || (isSelected && !isNext) ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span
                  className={`text-xs ${
                    isPassed
                      ? "text-muted-foreground line-through"
                      : isNext || isSelected
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
                  {isSelected && !isNext && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      SELECTED
                    </span>
                  )}
                </span>
                {isSelected && (
                  <span className="text-xs font-bold text-primary tabular-nums">{formatCompactTime(totalMins)}</span>
                )}
                {isNext && !isSelected && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">~{formatCompactTime(bus.etaMinutes)}</span>
                )}
                {futureETA !== null && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">~{formatCompactTime(futureETA)}</span>
                )}
                {isPassed && (
                  <MapPin className="w-3 h-3 text-primary/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
