import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BusMap } from "@/components/BusMap";
import { RoutePanel } from "@/components/RoutePanel";
import { MobileBottomSheet } from "@/components/MobileBottomSheet";
import { BusRoute, Bus } from "@/data/routes";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchRoutes, socket } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, logoutState, isAuthenticated } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const isMobile = useIsMobile();

  const { data: sriLankaRoutes = [], isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
    refetchInterval: 5000,
  });

  const [liveBuses, setLiveBuses] = useState<{ [routeId: string]: Bus[] }>({});

  useEffect(() => {
    if (!selectedRoute) return;
    
    const parsedRouteId = parseInt(selectedRoute.id.replace(/\D/g, ''));
    if (parsedRouteId) {
      socket.emit("subscribe:route", { routeId: parsedRouteId });
      
      const handleRouteBuses = (data: { routeId: number, buses: any[] }) => {
        if (data.routeId === parsedRouteId) {
          const mappedBuses = data.buses
            .map(b => ({
            id: `b${b.busId}`,
            plateNumber: b.busNumber,
            lat: b.estimatedPosition?.lat || 0,
            lng: b.estimatedPosition?.lng || 0,
            speed: b.speed || 0,
            heading: 0,
            isSimulated: b.isSimulated,
            status: b.lastConfirmedStop && !b.isSimulated ? "online" : "offline",
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            occupancy: "low",
            nextStop: b.next_stop_name || "Unknown",
            etaMinutes: b.eta?.eta_minutes || 0,
            hasConfirmedStop: b.lastConfirmedStop !== null
          } as Bus));
          
          setLiveBuses(prev => ({ ...prev, [selectedRoute.id]: mappedBuses }));
        }
      };

      socket.on("route:buses", handleRouteBuses);

      return () => {
        socket.off("route:buses", handleRouteBuses);
        socket.emit("unsubscribe:route", { routeId: parsedRouteId });
      };
    }
  }, [selectedRoute?.id]);

  const activeBuses = selectedRoute ? (liveBuses[selectedRoute.id] || selectedRoute.buses) : [];

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
          activeBuses={activeBuses}
        />
      </div>

      {/* Top right floating auth strip */}
      <div className="absolute top-4 right-4 z-[9999] flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-border">
            <span className="text-sm font-medium">Hi, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={logoutState} className="h-6 text-xs px-2 hover:bg-destructive/10 hover:text-destructive">
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="secondary" className="shadow-lg bg-white/90 backdrop-blur hover:bg-white text-primary">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="shadow-lg">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>

      {isMobile ? (
        /* Mobile: Bottom Sheet */
        <MobileBottomSheet
          routes={sriLankaRoutes}
          selectedRoute={selectedRoute}
          selectedBus={selectedBus}
          activeBuses={activeBuses}
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
                    activeBuses={activeBuses}
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
        <Stat label="Live Buses" value={sriLankaRoutes.reduce((a, r) => a + r.buses.filter(b => (b as any).hasConfirmedStop).length, 0).toString()} />
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
