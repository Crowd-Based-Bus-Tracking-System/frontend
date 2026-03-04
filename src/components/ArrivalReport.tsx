import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle, Send } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportArrival, fetchRecentReports, socket } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface ArrivalReportProps {
  route: BusRoute;
  bus: Bus;
}

interface Report {
  id: string;
  stopName: string;
  timestamp: string;
  upvotes: number;
}

export function ArrivalReport({ route, bus }: ArrivalReportProps) {
  const { user, isAuthenticated } = useAuth();
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const parsedBusId = parseInt(bus.id.replace(/\D/g, ''));
  const parsedRouteId = parseInt(route.id.replace(/\D/g, ''));

  const { data: reportsData } = useQuery({
    queryKey: ["reports", parsedBusId],
    queryFn: () => fetchRecentReports(parsedBusId),
    enabled: !!parsedBusId
  });

  const reports: Report[] = reportsData?.reports || [];

  useEffect(() => {
    if (!parsedRouteId) return;

    const handleNewReport = (report: Report) => {
        // Optimistically add new report to cache
        queryClient.setQueryData(["reports", parsedBusId], (old: any) => {
            if (!old) return { reports: [report] };
            // Ensure we don't duplicate
            if (old.reports.find((r: Report) => r.id === report.id)) return old;
            return { ...old, reports: [report, ...old.reports] };
        });
    };

    socket.on("bus:new_report", handleNewReport);

    return () => {
        socket.off("bus:new_report", handleNewReport);
    };
  }, [parsedRouteId, parsedBusId, queryClient]);

  const reportMutation = useMutation({
    mutationFn: async (stopName: string) => {
      const stopDef = route.stops.find((s) => s.name === stopName);
      if (!route.id || !bus.id || !stopDef?.id) throw new Error("Missing valid database IDs for arrival reporting.");
      
      const parsedStopId = parseInt(stopDef.id.replace(/\D/g, ''));
      
      const getPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
             reject(new Error("Geolocation is not supported."));
          } else {
             navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          }
        });
      };

      let userLat = stopDef.lat; 
      let userLng = stopDef.lng;
      
      try {
        const position = await getPosition();
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      } catch (err) {
        console.warn("Could not get exact location, using fallback stop coordinates.", err);
        userLat = stopDef.lat + (Math.random() - 0.05) * 0.000001; 
        userLng = stopDef.lng + (Math.random() - 0.05) * 0.000001;
      }

      return reportArrival(
        parsedRouteId, 
        parsedBusId, 
        parsedStopId, 
        Math.floor(Date.now() / 1000),
        userLat,
        userLng,
        user?.id || "anonymous-browser"
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setSelectedStop("");
      // Real-time socket will append it for us globally
    }
  });

  const handleReport = () => {
    if (!selectedStop) return;
    reportMutation.mutate(selectedStop);
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
        <p className="text-xs font-medium text-foreground mb-2">Report Bus Arrival</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          {isAuthenticated 
            ? `Help other passengers by reporting when ${bus.plateNumber} arrives at a stop`
            : "You must be logged in to submit arrival reports."}
        </p>

        <select
          value={selectedStop}
          onChange={(e) => setSelectedStop(e.target.value)}
          disabled={!isAuthenticated}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-2 outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select stop...</option>
          {route.stops.map((stop) => (
            <option key={stop.id} value={stop.name}>
              {stop.name}
            </option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReport}
          disabled={!selectedStop || reportMutation.isPending || !isAuthenticated}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {reportMutation.isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {!isAuthenticated 
            ? "Login to Report"
            : reportMutation.isPending 
              ? "Reporting..." 
              : "Report Arrival"}
        </motion.button>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-bus-online/10 border border-bus-online/30"
          >
            <CheckCircle className="w-4 h-4 text-bus-online" />
            <span className="text-xs text-bus-online font-medium">Report submitted! Thank you!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total reports summary */}
      {reports.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Total Reports</span>
          </div>
          <span className="text-sm font-bold text-primary">{reports.length}</span>
        </div>
      )}
    </div>
  );
}
