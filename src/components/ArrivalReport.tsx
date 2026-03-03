import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle, Send, ThumbsUp } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { useMutation } from "@tanstack/react-query";
import { reportArrival } from "@/services/api";

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
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = useMutation({
    mutationFn: async (stopName: string) => {
      const stopDef = route.stops.find((s) => s.name === stopName);
      if (!route.id || !bus.id || !stopDef?.id) throw new Error("Missing valid database IDs for arrival reporting.");
      
      const parsedRouteId = parseInt(route.id.replace(/\D/g, ''));
      const parsedBusId = parseInt(bus.id.replace(/\D/g, ''));
      const parsedStopId = parseInt(stopDef.id.replace(/\D/g, ''));
      
      return reportArrival(
        parsedRouteId, 
        parsedBusId, 
        parsedStopId, 
        Math.floor(Date.now() / 1000)
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setSelectedStop("");
      
      // Keep optimistic UI rendering mechanism for reports demo
      const newReport: Report = {
        id: Date.now().toString(),
        stopName: selectedStop,
        timestamp: new Date().toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" }),
        upvotes: 1,
      };
      setReports((prev) => [newReport, ...prev]);
    }
  });

  const handleReport = () => {
    if (!selectedStop) return;
    reportMutation.mutate(selectedStop);
  };

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
        <p className="text-xs font-medium text-foreground mb-2">Report Bus Arrival</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Help other passengers by reporting when {bus.plateNumber} arrives at a stop
        </p>

        <select
          value={selectedStop}
          onChange={(e) => setSelectedStop(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-2 outline-none focus:ring-2 focus:ring-primary/50"
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
          disabled={!selectedStop || reportMutation.isPending}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {reportMutation.isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {reportMutation.isPending ? "Reporting..." : "Report Arrival"}
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
            <span className="text-xs text-bus-online font-medium">Report submitted! Thank you 🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent reports */}
      {reports.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 px-1">RECENT REPORTS</p>
          <div className="space-y-1.5">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{report.stopName}</p>
                    <p className="text-[10px] text-muted-foreground">{report.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpvote(report.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-medium text-foreground">{report.upvotes}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
