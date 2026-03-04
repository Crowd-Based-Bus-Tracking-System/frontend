import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle2 } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useQuery } from "@tanstack/react-query";
import { predictETA } from "@/services/api";

interface ETACountdownProps {
  route: BusRoute;
  bus: Bus;
  selectedMapStopId?: number | null;
}

export function ETACountdown({ route, bus, selectedMapStopId }: ETACountdownProps) {
  const fallbackNextStopIndex = route.stops.findIndex((s) => s.name === bus.nextStop);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [cachedConfirmedStopId, setCachedConfirmedStopId] = useState<number | null>(null);
  const [locallyPassedStops, setLocallyPassedStops] = useState<Set<number>>(new Set());

  // Sync manually selected stop from the map popup into the local expansion state
  useEffect(() => {
    console.log("ETACountdown received selectedMapStopId:", selectedMapStopId);
    if (selectedMapStopId != null) {
      const idx = route.stops.findIndex(s => parseInt(s.id.replace(/\D/g, '')) === selectedMapStopId);
      console.log("ETACountdown calculated index:", idx, "current selectedStopIndex:", selectedStopIndex);
      if (idx !== -1 && idx !== selectedStopIndex) {
        setSelectedStopIndex(idx);
      }
    }
  }, [selectedMapStopId, route.stops]);

  const lastConfirmedStopIndex = cachedConfirmedStopId != null
    ? route.stops.findIndex(s => parseInt(s.id.replace(/\D/g, '')) === cachedConfirmedStopId)
    : -1;

  const confirmedNextIndex = lastConfirmedStopIndex >= 0 
    ? Math.min(lastConfirmedStopIndex + 1, route.stops.length - 1) 
    : fallbackNextStopIndex;

  const effectiveTargetIndex = selectedStopIndex !== null 
    ? selectedStopIndex 
    : (confirmedNextIndex >= 0 ? confirmedNextIndex : 0);
  
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

  // Update cached confirmed stop ID when ETA prediction updates
  useEffect(() => {
    if (etaPrediction?.data?.last_confirmed_stop != null) {
      setCachedConfirmedStopId(etaPrediction.data.last_confirmed_stop);
    }
  }, [etaPrediction?.data?.last_confirmed_stop]);

  const isJourneyComplete = lastConfirmedStopIndex >= 0 && lastConfirmedStopIndex >= route.stops.length - 1;
  const isTargetPassed = etaPrediction?.data?.is_passed === true;

  const [seconds, setSeconds] = useState(0);
  const [zeroReachedAt, setZeroReachedAt] = useState<number | null>(null);

  // If the manually selected stop gets passed officially, clear the selection
  // so the UI natively tracks the bus's true next stop
  useEffect(() => {
    if (selectedStopIndex !== null && lastConfirmedStopIndex >= 0 && selectedStopIndex <= lastConfirmedStopIndex) {
      setSelectedStopIndex(null);
    }
  }, [selectedStopIndex, lastConfirmedStopIndex]);

  useEffect(() => {
    if (isJourneyComplete || isTargetPassed) {
      setSeconds(0);
      return;
    }
    
    // Don't overwrite countdown for stops that have already locally passed
    if (locallyPassedStops.has(effectiveTargetIndex)) {
      return;
    }
    
    // Check for precise seconds first
    if (etaPrediction?.data?.eta_seconds !== undefined && etaPrediction.data.eta_seconds !== null) {
      setSeconds(Math.max(0, etaPrediction.data.eta_seconds));
    } else if (etaPrediction?.data?.eta_minutes !== undefined && etaPrediction.data.eta_minutes !== null) {
      setSeconds(Math.max(0, etaPrediction.data.eta_minutes * 60));
    } else if (effectiveTargetIndex === fallbackNextStopIndex) {
      setSeconds(Math.max(0, bus.etaMinutes * 60));
    } else {
      const offsetStops = Math.max(0, effectiveTargetIndex - confirmedNextIndex);
      setSeconds((bus.etaMinutes + offsetStops * 8) * 60);
    }
  }, [etaPrediction, bus.etaMinutes, bus.id, effectiveTargetIndex, fallbackNextStopIndex, isJourneyComplete, isTargetPassed, confirmedNextIndex, locallyPassedStops]);

  useEffect(() => {
    if (isJourneyComplete) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isJourneyComplete]);

  const maxSeconds = (etaPrediction?.data?.eta_minutes || bus.etaMinutes || 60) * 60;

  useEffect(() => {
    if (isJourneyComplete) return;

    // We reached 0 OR the ETA engine specifically told us it's passed geographically
    if (isTargetPassed || (seconds === 0 && maxSeconds > 0)) {
      if (!zeroReachedAt) {
        setZeroReachedAt(Date.now());
      } else {
        // Wait 3 seconds before auto-advancing to next stop
        const waitThresholdMs = isTargetPassed ? 3000 : 3000;
        
        if (Date.now() - zeroReachedAt > waitThresholdMs) {
          // Mark current stop as locally passed
          setLocallyPassedStops(prev => new Set([...prev, effectiveTargetIndex]));
          
          if (effectiveTargetIndex < route.stops.length - 1) {
            setSelectedStopIndex(effectiveTargetIndex + 1);
            setZeroReachedAt(null);
          }
        }
      }
    } else {
      setZeroReachedAt(null);
    }
  }, [seconds, zeroReachedAt, maxSeconds, effectiveTargetIndex, route.stops.length, isJourneyComplete, isTargetPassed]);

  const days = Math.floor(seconds / (24 * 3600));
  const hrs = Math.floor((seconds % (24 * 3600)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const totalMins = Math.floor(seconds / 60);
  const progress = 1 - Math.min(seconds / maxSeconds, 1);

  const formatCompactTime = (totalMinutes: number) => {
    if (totalMinutes >= 1440) return `${Math.floor(totalMinutes / 1440)}d ${Math.floor((totalMinutes % 1440) / 60)}h`;
    if (totalMinutes >= 60) return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    return `${totalMinutes}m`;
  };

  return (
    <div className="space-y-3">
      {/* Big countdown or Journey Complete */}
      {isJourneyComplete ? (
        <div className="relative p-4 rounded-xl bg-bus-online/10 border border-bus-online/30 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-bus-online" />
              <span className="text-xs font-semibold text-bus-online">Journey Complete</span>
            </div>
            <span className="text-sm font-bold text-bus-online">Arrived ✓</span>
          </div>
        </div>
      ) : (
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
      )}

      {/* Stop-by-stop ETA */}
      <div className="space-y-0">
        {route.stops.map((stop, i) => {
          // Use confirmed stop data for accurate passed-stop detection
          const isPassed = locallyPassedStops.has(i) || (lastConfirmedStopIndex >= 0
            ? i <= lastConfirmedStopIndex
            : (fallbackNextStopIndex > 0 && i < fallbackNextStopIndex));
          
          const isNext = lastConfirmedStopIndex >= 0
            ? i === lastConfirmedStopIndex + 1 && !isJourneyComplete
            : i === fallbackNextStopIndex;

          const isFuture = !isPassed && !isNext;
          const isSelected = i === effectiveTargetIndex && !isJourneyComplete;
          
          // Approximate ETAs for future non-selected stops
          const activeNext = lastConfirmedStopIndex >= 0 ? lastConfirmedStopIndex + 1 : fallbackNextStopIndex;
          const futureETA = isFuture && !isSelected && activeNext >= 0 
            ? totalMins + (i - effectiveTargetIndex) * 8 
            : null;

          return (
            <div 
              key={stop.id} 
              className={`flex items-center gap-3 py-3 px-2 -mx-2 rounded-md transition-colors ${
                isSelected ? 'bg-primary/5' : ''
              } ${isFuture && !isJourneyComplete ? 'cursor-pointer hover:bg-muted' : ''}`}
              onClick={() => {
                if ((isFuture || isNext) && !isJourneyComplete) setSelectedStopIndex(i);
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
                  animate={isSelected && !isPassed ? { scale: [1, 1.3, 1] } : {}}
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
                  className={`flex items-center flex-wrap gap-1.5 text-xs ${
                    isPassed
                      ? "text-muted-foreground"
                      : isNext || isSelected
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className={isPassed ? "line-through opacity-70" : ""}>{stop.name}</span>
                  {isPassed && i === lastConfirmedStopIndex && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium border border-primary/20 no-underline">
                      LAST SEEN
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium border border-accent/20 no-underline">
                      NEXT
                    </span>
                  )}
                  {isSelected && !isNext && !isPassed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium border border-primary/20 no-underline">
                      SELECTED
                    </span>
                  )}
                </span>
                {isSelected && !isPassed && !isJourneyComplete && (
                  <span className="text-xs font-bold text-primary tabular-nums">{formatCompactTime(totalMins)}</span>
                )}
                {isNext && !isSelected && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">~{formatCompactTime(bus.etaMinutes)}</span>
                )}
                {futureETA !== null && !isJourneyComplete && (
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
