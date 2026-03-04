import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, Send, TrendingUp, Gauge } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportOccupancy, fetchCurrentOccupancy, fetchOccupancyReports, socket } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface OccupancyReportProps {
  route: BusRoute;
  bus: Bus;
}

const OCCUPANCY_LEVELS = [
  { level: 1, label: "Empty", emoji: "🪑", color: "from-emerald-500 to-green-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  { level: 2, label: "Low", emoji: "🧍", color: "from-green-500 to-teal-400", bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
  { level: 3, label: "Moderate", emoji: "👥", color: "from-amber-500 to-yellow-400", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  { level: 4, label: "High", emoji: "🚌", color: "from-orange-500 to-red-400", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  { level: 5, label: "Full", emoji: "🚫", color: "from-red-600 to-red-400", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
];

interface OccupancyReport {
  id: string;
  busId: string | number;
  stopId: string | number;
  occupancyLevel: number;
  reportCount: number;
  timestamp: string;
}

export function OccupancyReport({ route, bus }: OccupancyReportProps) {
  const { user, isAuthenticated } = useAuth();
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const parsedBusId = parseInt(bus.id.replace(/\D/g, ''));
  const parsedRouteId = parseInt(route.id.replace(/\D/g, ''));

  // Fetch current confirmed occupancy
  const { data: currentOccupancy } = useQuery({
    queryKey: ["occupancy", parsedBusId],
    queryFn: () => fetchCurrentOccupancy(parsedBusId),
    enabled: !!parsedBusId,
    refetchInterval: 30000
  });

  // Fetch recent reports
  const { data: reportsData } = useQuery({
    queryKey: ["occupancy-reports", parsedBusId],
    queryFn: () => fetchOccupancyReports(parsedBusId),
    enabled: !!parsedBusId
  });

  const reports: OccupancyReport[] = reportsData?.reports || [];

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!parsedRouteId) return;

    const handleOccupancyReport = (report: OccupancyReport) => {
      queryClient.setQueryData(["occupancy-reports", parsedBusId], (old: any) => {
        if (!old) return { reports: [report] };
        if (old.reports.find((r: OccupancyReport) => r.id === report.id)) return old;
        return { ...old, reports: [report, ...old.reports].slice(0, 10) };
      });
    };

    const handleOccupancyConfirmed = (data: any) => {
      if (data.busId === parsedBusId) {
        queryClient.setQueryData(["occupancy", parsedBusId], {
          success: true,
          occupancy: {
            level: data.occupancyLevel,
            stopId: data.stopId,
            confirmedAt: data.confirmedAt,
            reportCount: data.reportCount
          }
        });
      }
    };

    socket.on("bus:occupancy_report", handleOccupancyReport);
    socket.on("bus:occupancy_confirmed", handleOccupancyConfirmed);

    return () => {
      socket.off("bus:occupancy_report", handleOccupancyReport);
      socket.off("bus:occupancy_confirmed", handleOccupancyConfirmed);
    };
  }, [parsedRouteId, parsedBusId, queryClient]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStop || selectedLevel === null) throw new Error("Select stop and occupancy level");
      const stopDef = route.stops.find((s) => s.name === selectedStop);
      if (!stopDef?.id) throw new Error("Invalid stop");

      const parsedStopId = parseInt(stopDef.id.replace(/\D/g, ''));

      let userLat = stopDef.lat;
      let userLng = stopDef.lng;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation
            ? navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
            : reject(new Error("Not supported"));
        });
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      } catch {
        userLat = stopDef.lat + (Math.random() - 0.5) * 0.000001;
        userLng = stopDef.lng + (Math.random() - 0.5) * 0.000001;
      }

      return reportOccupancy(
        parsedRouteId, parsedBusId, parsedStopId,
        selectedLevel, userLat, userLng,
        user?.id || "anonymous-browser"
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setSelectedLevel(null);
      setSelectedStop("");
    }
  });

  const confirmedLevel = currentOccupancy?.occupancy?.level;
  const confirmedConfig = confirmedLevel ? OCCUPANCY_LEVELS.find(l => l.level === confirmedLevel) : null;

  return (
    <div className="space-y-3">
      {/* Current Occupancy Display */}
      {confirmedConfig && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl ${confirmedConfig.bg} border ${confirmedConfig.border}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className={`w-4 h-4 ${confirmedConfig.text}`} />
              <span className="text-xs font-semibold text-foreground">Current Occupancy</span>
            </div>
            <span className={`text-lg ${confirmedConfig.text}`}>{confirmedConfig.emoji}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-2 flex-1 rounded-full bg-muted/30 overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(confirmedLevel / 5) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${confirmedConfig.color}`}
              />
            </div>
            <span className={`text-sm font-bold ${confirmedConfig.text}`}>{confirmedConfig.label}</span>
          </div>
        </motion.div>
      )}

      {/* Report Form */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-medium text-foreground">Report Bus Occupancy</p>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          {isAuthenticated
            ? `How crowded is ${bus.plateNumber}?`
            : "You must be logged in to submit reports."}
        </p>

        {/* Stop Select */}
        <select
          value={selectedStop}
          onChange={(e) => setSelectedStop(e.target.value)}
          disabled={!isAuthenticated}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select stop...</option>
          {route.stops.map((stop) => (
            <option key={stop.id} value={stop.name}>{stop.name}</option>
          ))}
        </select>

        {/* Occupancy Level Buttons */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {OCCUPANCY_LEVELS.map((occ) => (
            <motion.button
              key={occ.level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLevel(occ.level)}
              disabled={!isAuthenticated}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                selectedLevel === occ.level
                  ? `${occ.bg} ${occ.border} ring-2 ring-offset-1 ring-offset-background ring-current ${occ.text}`
                  : "bg-card border-border/50 hover:bg-muted/80"
              }`}
            >
              <span className="text-base">{occ.emoji}</span>
              <span className="text-[9px] font-medium leading-tight">{occ.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => reportMutation.mutate()}
          disabled={!selectedStop || selectedLevel === null || reportMutation.isPending || !isAuthenticated}
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
              : "Report Occupancy"}
        </motion.button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-bus-online/10 border border-bus-online/30"
          >
            <CheckCircle className="w-4 h-4 text-bus-online" />
            <span className="text-xs text-bus-online font-medium">Occupancy report submitted!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total reports summary */}
      {reports.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Total Reports</span>
          </div>
          <span className="text-sm font-bold text-primary">{reports.length}</span>
        </div>
      )}
    </div>
  );
}
