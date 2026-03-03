import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BusMap } from "@/components/BusMap";
import { RoutePanel } from "@/components/RoutePanel";
import { MobileBottomSheet } from "@/components/MobileBottomSheet";
import { BusRoute, Bus } from "@/data/routes";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchRoutes } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const isMobile = useIsMobile();

  const { data: sriLankaRoutes = [], isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
    refetchInterval: 5000,
  });

  const handleSelectRoute = (route: BusRoute) => {
    setSelectedRoute(route);
    setSelectedBus(null);
  };

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
  };

  const handleBack = () => {
    setSelectedRoute(null);
    setSelectedBus(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground flex-col gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="font-semibold text-lg text-primary">Loading live transit system...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <BusMap
          selectedRoute={selectedRoute}
          selectedBus={selectedBus}
          routes={sriLankaRoutes}
          onSelectBus={handleSelectBus}
        />
      </div>

      {isMobile ? (
        /* Mobile: Bottom Sheet */
        <MobileBottomSheet
          routes={sriLankaRoutes}
          selectedRoute={selectedRoute}
          selectedBus={selectedBus}
          onSelectRoute={handleSelectRoute}
          onSelectBus={handleSelectBus}
          onBack={handleBack}
        />
      ) : (
        <>
          {/* Desktop: Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPanelOpen(!panelOpen)}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            {panelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>

          {/* Desktop: Side Panel */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ x: -380, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -380, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 z-10 h-full w-[340px] glass-panel rounded-r-2xl"
              >
                <div className="pt-16 h-full">
                  <RoutePanel
                    routes={sriLankaRoutes}
                    selectedRoute={selectedRoute}
                    selectedBus={selectedBus}
                    onSelectRoute={handleSelectRoute}
                    onSelectBus={handleSelectBus}
                    onBack={handleBack}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className={`absolute ${isMobile ? "bottom-[90px]" : "bottom-4"} left-1/2 -translate-x-1/2 z-20 glass-panel rounded-2xl px-6 py-3 flex items-center gap-6`}
      >
        <Stat label="Routes" value={sriLankaRoutes.length.toString()} />
        <div className="w-px h-8 bg-border" />
        <Stat label="Live Buses" value={sriLankaRoutes.reduce((a, r) => a + r.buses.filter(b => b.status === "online").length, 0).toString()} />
        <div className="w-px h-8 bg-border" />
        <Stat label="Stops" value={sriLankaRoutes.reduce((a, r) => a + r.stops.length, 0).toString()} />
      </motion.div>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default Index;
