import { useAppStore } from "../store";
import { motion } from "motion/react";
import { User, AlertTriangle } from "lucide-react";

export default function StadiumVisual() {
  const { activeStadium, isEvacuationMode } = useAppStore();

  if (!activeStadium) return null;

  const gates = activeStadium.zones.filter((z) => z.type === "gate");
  const seating = activeStadium.zones.filter((z) => z.type === "seating");

  const getStatusColor = (
    current: number,
    capacity: number,
    status: string,
  ) => {
    if (status === "closed")
      return "bg-slate-900 border-slate-700 text-slate-500";
    if (status === "redirecting")
      return "bg-yellow-500/10 border-yellow-500/50 text-yellow-400";

    const percentage = current / capacity;
    if (percentage > 0.85)
      return "bg-red-500/10 border-red-500/50 text-red-500";
    if (percentage > 0.6)
      return "bg-yellow-500/10 border-yellow-500/50 text-yellow-400";
    return "bg-green-500/10 border-green-500/50 text-green-400";
  };

  const getDensityData = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const leftGates = gates.slice(0, Math.ceil(gates.length / 2));
  const rightGates = gates.slice(Math.ceil(gates.length / 2));
  const isLeftGate = (gateId: string) => leftGates.some((g) => g.id === gateId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col shadow-xl">
      <div className="flex items-center justify-between mb-4 z-10 relative">
        <span className="text-xs font-bold uppercase tracking-widest bg-slate-950/80 px-3 py-1.5 border border-slate-800 rounded-lg text-blue-400 flex items-center gap-2">
          Live Density Heatmap
        </span>
        <div className="text-[10px] text-slate-400 flex gap-4 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-green-500"></div> Clear
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-yellow-500"></div> Busy
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-red-500"></div> Critical
          </div>
        </div>
      </div>

      <div className="relative aspect-video max-w-4xl w-full mx-auto bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Pitch */}
        <motion.div
          className="absolute w-32 h-32 sm:w-56 sm:h-56 bg-slate-900 border-2 border-slate-700/50 rounded-full z-10 flex flex-col justify-center items-center shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-6 bg-[#1e293b] border border-slate-600 rounded-[2px]"></div>
          <span className="text-slate-500 font-bold text-[10px] mt-2 tracking-widest uppercase">
            Pitch Layout
          </span>
        </motion.div>

        {/* Dynamic Inner Glow based on average density */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950/20 to-slate-950 opacity-60"></div>

        <div className="absolute inset-8 border-[20px] sm:border-[40px] border-slate-900/50 rounded-full pointer-events-none mix-blend-overlay"></div>

        {/* Seating Zones */}
        <div className="absolute inset-4 flex flex-col justify-between items-center z-10 pointer-events-none">
          {seating.map((zone, i) => {
            const density = getDensityData(zone.currentCount, zone.capacity);
            const isHighDensity = density > 60;

            let bestGate = gates.find(
              (g) =>
                g.id === zone.nearestGateId &&
                g.status !== "closed" &&
                getDensityData(g.currentCount, g.capacity) < 85,
            );
            if (!bestGate && gates.length > 0) {
              bestGate = [...gates]
                .filter((g) => g.status !== "closed")
                .sort(
                  (a, b) =>
                    getDensityData(a.currentCount, a.capacity) -
                    getDensityData(b.currentCount, b.capacity),
                )[0];
            }

            return (
              <motion.div
                key={zone.id}
                className={`relative pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-[9px] sm:text-[10px] uppercase tracking-widest font-bold shadow-lg flex items-center gap-2 backdrop-blur-md ${getStatusColor(zone.currentCount, zone.capacity, zone.status)}`}
                animate={{ y: 0 }}
              >
                {density > 85 ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {zone.name}: {density}%
                {isEvacuationMode && bestGate && isHighDensity && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 ${isLeftGate(bestGate.id) ? "right-[calc(100%+8px)] flex-row-reverse" : "left-[calc(100%+8px)]"} pointer-events-none flex items-center gap-1`}
                  >
                    <motion.div
                      className={`text-[8px] whitespace-nowrap bg-red-500/20 border border-red-500/50 text-red-100 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.4)] ${isLeftGate(bestGate.id) ? "order-1" : "order-2"}`}
                    >
                      Route to {bestGate.name}
                    </motion.div>
                    <motion.div
                      className={`text-red-500 flex items-center ${isLeftGate(bestGate.id) ? "order-2" : "order-1"}`}
                    >
                      {isLeftGate(bestGate.id) ? (
                        <motion.span
                          animate={{ x: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          &larr;
                        </motion.span>
                      ) : (
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          &rarr;
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Gates Output */}
        <div className="absolute inset-4 flex justify-between items-center px-2 sm:px-4 z-20 pointer-events-none">
          <div className="flex flex-col gap-4">
            {leftGates.map((gate) => {
              const density = getDensityData(gate.currentCount, gate.capacity);
              return (
                <div
                  key={gate.id}
                  className={`pointer-events-auto px-2 py-1.5 rounded bg-slate-900 border text-[9px] sm:text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 ${getStatusColor(gate.currentCount, gate.capacity, gate.status)} ${isEvacuationMode && gate.status !== "closed" && density < 85 ? "shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500/50" : "shadow-lg"}`}
                >
                  {gate.name} <span className="font-mono">{density}%</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-4 items-end">
            {rightGates.map((gate) => {
              const density = getDensityData(gate.currentCount, gate.capacity);
              return (
                <div
                  key={gate.id}
                  className={`pointer-events-auto px-2 py-1.5 rounded bg-slate-900 border text-[9px] sm:text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 ${getStatusColor(gate.currentCount, gate.capacity, gate.status)} ${isEvacuationMode && gate.status !== "closed" && density < 85 ? "shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500/50" : "shadow-lg"}`}
                >
                  {gate.name} <span className="font-mono">{density}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
