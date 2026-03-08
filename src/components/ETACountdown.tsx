import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useQuery } from "@tanstack/react-query";
import { predictETA } from "@/services/api";

interface ETACountdownProps {
  route: BusRoute;
  bus: Bus;
  selectedMapStopId?: number | null;
}

export function ETACountdown({
  route,
  bus,
  selectedMapStopId,
}: ETACountdownProps) {
  const isDev = process.env.NODE_ENV === "development";

  const fallbackNextStopIndex = useMemo(
    () => route.stops.findIndex((s) => s.name === bus.nextStop),
    [route.stops, bus.nextStop],
  );
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(
    null,
  );
  const [cachedConfirmedStopId, setCachedConfirmedStopId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (isDev) {
      console.log(
        "ETACountdown received selectedMapStopId:",
        selectedMapStopId,
      );
    }
    if (selectedMapStopId != null && route.stopIdMapping) {
      const idx = route.stopIdMapping.indexOf(selectedMapStopId);
      if (idx !== -1) {
        setSelectedStopIndex((prev) => {
          if (isDev) {
            console.log(
              "ETACountdown calculated index:",
              idx,
              "current selectedStopIndex:",
              prev,
              "setting selectedStopIndex to:",
              idx,
            );
          }
          return prev !== idx ? idx : prev;
        });
      }
    }
  }, [selectedMapStopId, route.stopIdMapping, bus.id, isDev]);

  const lastConfirmedStopIndex =
    cachedConfirmedStopId != null && route.stopIdMapping
      ? route.stopIdMapping.indexOf(cachedConfirmedStopId)
      : -1;

  const confirmedNextIndex =
    lastConfirmedStopIndex >= 0
      ? Math.min(lastConfirmedStopIndex + 1, route.stops.length - 1)
      : fallbackNextStopIndex;

  const { data: etaPrediction, isLoading } = useQuery({
    queryKey: ["eta", route.id, bus.id],
    queryFn: async () => {
      const parsedRouteId = parseInt(route.id.replace(/\D/g, ""));
      const parsedBusId = parseInt(bus.id.replace(/\D/g, ""));
      if (!parsedRouteId || !parsedBusId) return null;

      return predictETA(parsedRouteId, parsedBusId, null);
    },
    enabled: !!route.id && !!bus.id,
    refetchInterval: 5000,
  });

  const routeEtasData =
    etaPrediction?.data?.route_etas || etaPrediction?.route_etas;

  const nextRouteEta = useMemo(
    () => routeEtasData?.find((stop) => stop.is_passed === false),
    [routeEtasData],
  );
  const nextStopIndexFromBackend =
    nextRouteEta && route.stopIdMapping
      ? Math.max(route.stopIdMapping.indexOf(nextRouteEta.stop_id), -1)
      : -1;

  const updatedBackendEffectiveTargetIndex =
    selectedStopIndex !== null
      ? selectedStopIndex
      : nextStopIndexFromBackend >= 0
        ? nextStopIndexFromBackend
        : confirmedNextIndex >= 0
          ? confirmedNextIndex
          : 0;

  const routeEtaMap = useMemo(() => {
    const map = new Map();
    if (routeEtasData && Array.isArray(routeEtasData)) {
      routeEtasData.forEach((eta) => {
        map.set(eta.stop_id, eta);
      });
    }

    if (isDev) {
      console.log("Route ETA Map built:", {
        totalStops: routeEtasData?.length || 0,
        mapSize: map.size,
        mapKeys: Array.from(map.keys()),
        routeEtasData,
        routeStopIdMapping: route.stopIdMapping,
        isArray: Array.isArray(routeEtasData),
      });
    }

    return map;
  }, [routeEtasData, route.stopIdMapping]);

  const backendIsJourneyComplete =
    !!routeEtasData && !routeEtasData.some((s: any) => !s.is_passed);

  const updatedSafeEffectiveTargetIndex = Math.min(
    updatedBackendEffectiveTargetIndex,
    route.stops.length - 1,
  );
  const targetStopId =
    route.stopIdMapping?.[updatedSafeEffectiveTargetIndex] ?? null;

  const backendNextStopId = useMemo(
    () => nextRouteEta?.stop_id,
    [nextRouteEta],
  );

  const { data: selectedStopEtaPrediction } = useQuery({
    queryKey: ["eta", route.id, bus.id, targetStopId],
    queryFn: async () => {
      if (
        !route.id ||
        !bus.id ||
        selectedStopIndex === null ||
        targetStopId == null
      ) {
        return null;
      }

      const parsedRouteId = parseInt(route.id.replace(/\D/g, ""));
      const parsedBusId = parseInt(bus.id.replace(/\D/g, ""));

      if (!parsedRouteId || !parsedBusId || !targetStopId) {
        return null;
      }

      return predictETA(parsedRouteId, parsedBusId, targetStopId);
    },
    enabled:
      !!route.id &&
      !!bus.id &&
      targetStopId !== null &&
      selectedStopIndex !== null &&
      targetStopId !== nextRouteEta?.stop_id,
  });

  const finalCurrentEtaPrediction =
    selectedStopIndex !== null ? selectedStopEtaPrediction : etaPrediction;
  const finalIsTargetPassed =
    finalCurrentEtaPrediction?.data?.is_passed === true;

  const isTargetPassed = finalIsTargetPassed;

  const [seconds, setSeconds] = useState(0);
  const [zeroReachedAt, setZeroReachedAt] = useState<number | null>(null);

  useEffect(() => {
    if (
      selectedStopIndex !== null &&
      lastConfirmedStopIndex >= 0 &&
      selectedStopIndex <= lastConfirmedStopIndex
    ) {
      setSelectedStopIndex(null);
    }
  }, [selectedStopIndex, lastConfirmedStopIndex]);

  const activeStopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeStopRef.current) {
      setTimeout(() => {
        activeStopRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedMapStopId, bus.id, selectedStopIndex]);

  useEffect(() => {
    setCachedConfirmedStopId(null);
    if (selectedMapStopId == null) {
      setSelectedStopIndex(null);
    }
    setSeconds(0);
    setZeroReachedAt(null);
  }, [bus.id]);

  useEffect(() => {
    if (etaPrediction?.data?.last_confirmed_stop !== undefined) {
      setCachedConfirmedStopId(etaPrediction.data.last_confirmed_stop);
    }
  }, [etaPrediction?.data?.last_confirmed_stop]);


  useEffect(() => {
    if (backendIsJourneyComplete || isTargetPassed) {
      setSeconds(0);
      return;
    }

    if (
      routeEtaMap.get(route.stopIdMapping?.[updatedSafeEffectiveTargetIndex])
        ?.is_passed
    ) {
      return;
    }

    if (isDev) {
      console.log("ETA Countdown Debug:", {
        finalCurrentEtaPrediction: finalCurrentEtaPrediction?.data,
        updatedSafeEffectiveTargetIndex,
        backendIsJourneyComplete,
        isTargetPassed,
      });
    }

    const targetStopId = route.stopIdMapping?.[updatedSafeEffectiveTargetIndex];
    const targetStopEta = targetStopId ? routeEtaMap.get(targetStopId) : null;

    if (
      targetStopEta &&
      targetStopEta.eta_seconds !== undefined &&
      targetStopEta.eta_seconds !== null
    ) {
      const calculatedSeconds = Math.max(0, targetStopEta.eta_seconds);

      if (isDev) {
        console.log("Using route ETA for countdown:", {
          targetStopId,
          targetStopEta,
          calculatedSeconds,
        });
      }

      setSeconds(calculatedSeconds);
    } else if (
      finalCurrentEtaPrediction?.data?.arrival_time &&
      finalCurrentEtaPrediction.data.arrival_time !== null
    ) {
      const arrival =
        typeof finalCurrentEtaPrediction.data.arrival_time === "number"
          ? finalCurrentEtaPrediction.data.arrival_time
          : new Date(finalCurrentEtaPrediction.data.arrival_time).getTime();
      const now = Date.now();
      const calculatedSeconds = Math.max(0, Math.floor((arrival - now) / 1000));

      if (isDev) {
        console.log("Using arrival_time fallback:", {
          arrival,
          now,
          calculatedSeconds,
        });
      }

      setSeconds(calculatedSeconds);
    } else if (
      finalCurrentEtaPrediction?.data?.eta_seconds !== undefined &&
      finalCurrentEtaPrediction.data.eta_seconds !== null
    ) {
      const calculatedSeconds = Math.max(
        0,
        finalCurrentEtaPrediction.data.eta_seconds,
      );

      if (isDev) {
        console.log("Using eta_seconds fallback:", { calculatedSeconds });
      }

      setSeconds(calculatedSeconds);
    } else if (
      finalCurrentEtaPrediction?.data?.eta_minutes !== undefined &&
      finalCurrentEtaPrediction.data.eta_minutes !== null
    ) {
      const calculatedSeconds = Math.max(
        0,
        finalCurrentEtaPrediction.data.eta_minutes * 60,
      );

      if (isDev) {
        console.log("Using eta_minutes fallback:", { calculatedSeconds });
      }

      setSeconds(calculatedSeconds);
    } else {
      const calculatedSeconds = Math.max(0, bus.etaMinutes * 60);

      if (isDev) {
        console.log("Using bus.etaMinutes final fallback:", {
          calculatedSeconds,
        });
      }

      setSeconds(calculatedSeconds);
    }
  }, [
    finalCurrentEtaPrediction,
    bus.etaMinutes,
    bus.id,
    updatedSafeEffectiveTargetIndex,
    fallbackNextStopIndex,
    backendIsJourneyComplete,
    isTargetPassed,
    confirmedNextIndex,
    routeEtasData,
    backendNextStopId,
  ]);

  useEffect(() => {
    if (backendIsJourneyComplete) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [backendIsJourneyComplete]);

  const maxSeconds =
    (finalCurrentEtaPrediction?.data?.eta_minutes || bus.etaMinutes || 60) * 60;

  useEffect(() => {
    if (backendIsJourneyComplete) return;

    if (isTargetPassed) {
      if (!zeroReachedAt) {
        setZeroReachedAt(Date.now());
      } else {
        if (Date.now() - zeroReachedAt > 3000) {
          if (updatedSafeEffectiveTargetIndex < route.stops.length - 1) {
            setSelectedStopIndex(updatedSafeEffectiveTargetIndex + 1);
          }
          setZeroReachedAt(null);
        }
      }
    } else {
      setZeroReachedAt(null);
    }
  }, [
    isTargetPassed,
    zeroReachedAt,
    updatedSafeEffectiveTargetIndex,
    route.stops.length,
    backendIsJourneyComplete,
  ]);

  const days = Math.floor(seconds / (24 * 3600));
  const hrs = Math.floor((seconds % (24 * 3600)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const totalMins = Math.floor(seconds / 60);
  const progress = 1 - Math.min(seconds / maxSeconds, 1);

  const formatCompactTime = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    if (totalMinutes >= 1440)
      return `${Math.floor(totalMinutes / 1440)}d ${Math.floor((totalMinutes % 1440) / 60)}h`;
    if (totalMinutes >= 60)
      return `${Math.floor(totalMinutes / 60)}h ${Math.floor(totalMinutes % 60)}m`;
    return `${Math.floor(totalMinutes)}m`;
  };

  return (
    <div className="space-y-3">
      {/* Big countdown or Journey Complete */}
      {backendIsJourneyComplete ? (
        <div className="relative p-4 rounded-xl bg-bus-online/10 border border-bus-online/30 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-bus-online" />
              <span className="text-xs font-semibold text-bus-online">
                Journey Complete
              </span>
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
              <Clock
                className={`w-4 h-4 ${isLoading ? "animate-spin text-muted-foreground" : "text-primary"}`}
              />
              <span className="text-xs text-muted-foreground">
                Arriving at {route.stops[updatedSafeEffectiveTargetIndex]?.name}
              </span>
            </div>
            <div className="flex items-baseline gap-0.5">
              {days > 0 ? (
                <>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {days}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mr-1">
                    d
                  </span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {hrs}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    h
                  </span>
                </>
              ) : hrs > 0 ? (
                <>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {hrs}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mr-1">
                    h
                  </span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {mins}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    m
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {String(mins).padStart(2, "0")}
                  </span>
                  <span className="text-lg text-muted-foreground animate-pulse">
                    :
                  </span>
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
              <span className="text-xs font-semibold text-foreground">
                Speed
              </span>
            </div>
            <div className="text-sm font-bold text-primary mr-1">
              {bus.speed} km/h
            </div>
          </div>
        </div>
      )}

      {/* Stop-by-stop ETA */}
      <div className="space-y-0">
        {route.stops.map((stop, i) => {
          const backendStopId = route.stopIdMapping?.[i];
          const routeEtaItem = backendStopId
            ? routeEtaMap.get(backendStopId)
            : undefined;

          if (isDev && backendStopId && !routeEtaItem) {
            console.log(`Mapping failed for ${stop.name} (index ${i}):`, {
              backendStopId,
              mapKeys: Array.from(routeEtaMap.keys()),
              mapSize: routeEtaMap.size,
              hasKey: routeEtaMap.has(backendStopId),
            });
          }

          const backendNextIndexInRoute = backendNextStopId ? route.stopIdMapping?.indexOf(backendNextStopId) ?? -1 : -1;
          let isPassed = routeEtaItem?.is_passed === true || (backendNextIndexInRoute !== -1 && i < backendNextIndexInRoute);

          let isNext = backendStopId === backendNextStopId;

          if (isPassed && isNext) {
            isNext = false;
          }

          const isFuture = !isPassed && !isNext;
          const isSelected =
            i === updatedSafeEffectiveTargetIndex && !backendIsJourneyComplete;

          if (isDev && i >= 2 && i <= 4) {
            console.log(`ETA Calculation for ${stop.name} (index ${i}):`, {
              backendStopId,
              routeEtaItem,
              isFuture,
              isSelected,
              routeEtasData,
            });
          }

          let futureETA = null;
          let nextETA = bus.etaMinutes;

          if (!isSelected && !backendIsJourneyComplete) {
            if (isFuture && routeEtaItem?.eta_minutes !== undefined) {
              futureETA = routeEtaItem.eta_minutes;
            } else if (isNext && routeEtaItem?.eta_minutes !== undefined) {
              nextETA = routeEtaItem.eta_minutes;
            }
          }

          return (
            <div
              key={stop.id}
              ref={isSelected ? activeStopRef : null}
              className={`group flex items-center gap-3 py-3 px-2 -mx-2 rounded-md transition-colors min-h-[56px] ${
                isSelected ? "bg-primary/5" : ""
              } ${(isFuture || isNext) && !backendIsJourneyComplete && !isSelected ? "cursor-pointer hover:bg-muted" : ""}`}
              onClick={() => {
                if (isDev) {
                  console.log(`Stop clicked: ${stop.name} (index ${i})`, {
                    isFuture,
                    isNext,
                    backendIsJourneyComplete,
                    shouldSelect:
                      (isFuture || isNext) && !backendIsJourneyComplete,
                  });
                }
                if ((isFuture || isNext) && !backendIsJourneyComplete)
                  setSelectedStopIndex(i);
              }}
            >
              <div className="flex flex-col items-center w-4">
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isPassed
                      ? "bg-transparent border-muted-foreground/15"
                      : isSelected
                        ? "bg-primary border-primary"
                        : isNext
                          ? "bg-primary/20 border-primary/40"
                          : "bg-transparent border-border group-hover:border-foreground/40"
                  }`}
                  animate={
                    isSelected && !isPassed ? { scale: [1, 1.3, 1] } : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div
                  className={`w-0.5 h-5 transition-colors ${
                    isPassed
                      ? "bg-muted-foreground/15"
                      : isNext || isSelected
                        ? "bg-primary/40"
                        : "bg-border group-hover:bg-foreground/20"
                  }`}
                />
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
                  <span>{stop.name}</span>
                  {i === lastConfirmedStopIndex && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium border border-primary/20">
                      LAST SEEN
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 no-underline">
                      NEXT
                    </span>
                  )}
                  {isSelected && !isNext && !isPassed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium border border-primary/20 no-underline">
                      SELECTED
                    </span>
                  )}
                </span>
                {isSelected && !isPassed && !backendIsJourneyComplete && (
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {formatCompactTime(routeEtaItem?.eta_minutes || totalMins)}
                  </span>
                )}
                {isNext && !isSelected && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatCompactTime(nextETA)}
                  </span>
                )}
                {futureETA !== null && !backendIsJourneyComplete && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatCompactTime(futureETA)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
