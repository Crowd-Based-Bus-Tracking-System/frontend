import { useState } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { ChevronUp, GripHorizontal } from "lucide-react";
import { BusRoute, Bus } from "@/data/routes";
import { RoutePanel } from "./RoutePanel";

interface MobileBottomSheetProps {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
  activeBuses: Bus[];
  onSelectRoute: (route: BusRoute) => void;
  onSelectBus: (bus: Bus) => void;
  onBack: () => void;
}

type SheetState = "collapsed" | "half" | "full";

export function MobileBottomSheet({
  routes,
  selectedRoute,
  selectedBus,
  activeBuses,
  onSelectRoute,
  onSelectBus,
  onBack,
}: MobileBottomSheetProps) {
  const [state, setState] = useState<SheetState>("half");

  const heights: Record<SheetState, string> = {
    collapsed: "80px",
    half: "50vh",
    full: "85vh",
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 300 || offset > 100) {
      // Dragging down
      if (state === "full") setState("half");
      else setState("collapsed");
    } else if (velocity < -300 || offset < -100) {
      // Dragging up
      if (state === "collapsed") setState("half");
      else setState("full");
    }
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-30 glass-panel rounded-t-2xl flex flex-col"
      animate={{ height: heights[state] }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Drag handle */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-1" />
        <button
          onClick={() =>
            setState((s) =>
              s === "collapsed" ? "half" : s === "half" ? "full" : "collapsed"
            )
          }
          className="flex items-center gap-1 text-[10px] text-muted-foreground"
        >
          <ChevronUp
            className={`w-3 h-3 transition-transform ${
              state === "full" ? "rotate-180" : ""
            }`}
          />
          {state === "collapsed" ? "Show routes" : state === "half" ? "Expand" : "Collapse"}
        </button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <RoutePanel
          routes={routes}
          selectedRoute={selectedRoute}
          selectedBus={selectedBus}
          activeBuses={activeBuses}
          onSelectRoute={onSelectRoute}
          onSelectBus={onSelectBus}
          onBack={onBack}
        />
      </div>
    </motion.div>
  );
}
