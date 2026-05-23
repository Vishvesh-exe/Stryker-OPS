import React, { useState } from "react";
import { useAppStore } from "../store";
import StadiumVisual from "./StadiumVisual";
import ParkingMap from "./ParkingMap";
import { AlertTriangle, Ticket, MapPin, QrCode, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FanDashboard() {
  const { activeStadium, messages, user, setUser } = useAppStore();
  const [showQR, setShowQR] = useState(false);

  if (!activeStadium) return null;

  const userMessages = messages.filter(
    (m) => m.target === "all" || m.target === "fans",
  );

  const gates = activeStadium.zones.filter((z) => z.type === "gate");
  const snacks = activeStadium.zones.filter((z) => z.type === "snack");
  const seatingZones = activeStadium.zones.filter((z) => z.type === "seating");

  const getStatusText = (current: number, capacity: number, status: string) => {
    if (status === "closed")
      return {
        text: "Closed",
        color: "text-slate-500 border-slate-700 bg-slate-800",
      };
    if (status === "redirecting")
      return {
        text: "Redirecting",
        color: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
      };
    const pct = current / capacity;
    if (pct > 0.85)
      return {
        text: "Heavy",
        color: "text-red-500 border-red-500/50 bg-red-500/10",
      };
    if (pct > 0.6)
      return {
        text: "Busy",
        color: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
      };
    return {
      text: "Clear",
      color: "text-green-400 border-green-500/50 bg-green-500/10",
    };
  };

  const handleSeatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user) {
      setUser({ ...user, seatZoneId: e.target.value });
    }
  };

  const userSeatZone = seatingZones.find((z) => z.id === user?.seatZoneId);
  const recommendedGate = gates.find(
    (g) => g.id === userSeatZone?.nearestGateId,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Real-time Maps */}
      <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
        <StadiumVisual />
        <ParkingMap />
      </div>

      {/* Right Column - Status & Alerts */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
        {/* Fan Profile & Seating */}
        <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-5 flex flex-col relative overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-400" /> Match Ticket Profile
            </span>
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-widest bg-blue-500/10 px-2 py-1 rounded transition-colors"
            >
              <QrCode className="w-3 h-3" /> View Pass
            </button>
          </h3>
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center p-4 border border-blue-500/30 rounded-2xl"
              >
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <Ticket className="w-8 h-8 text-blue-400 mb-2" />
                <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center mb-4">
                  {/* Mock QR Code squares */}
                  <div className="w-full h-full bg-slate-900 flex flex-wrap gap-1 p-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: Math.random() > 0.3 ? 1 : 0 }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          repeatType: "reverse",
                        }}
                        className="w-1/5 h-1/5 bg-slate-100 rounded-[1px]"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white uppercase tracking-wider">
                    {user?.name}
                  </p>
                  <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest">
                    {activeStadium.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    {user?.id}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold mb-2 block">
                Your Seating Section
              </label>
              <select
                value={user?.seatZoneId || ""}
                onChange={handleSeatChange}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
              >
                <option value="" disabled>
                  Select your stand/zone
                </option>
                {seatingZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {recommendedGate && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] text-blue-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Recommended Entry
                    </h4>
                    <span className="text-slate-200 text-sm font-medium">
                      {recommendedGate.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusText(recommendedGate.currentCount, recommendedGate.capacity, recommendedGate.status).color}`}
                  >
                    {
                      getStatusText(
                        recommendedGate.currentCount,
                        recommendedGate.capacity,
                        recommendedGate.status,
                      ).text
                    }
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Parking map highlights spots closest to this gate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Logistics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800">
            Entry & Concessions
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-2">
                Gates
              </h4>
              <div className="space-y-2">
                {gates.map((gate) => {
                  const status = getStatusText(
                    gate.currentCount,
                    gate.capacity,
                    gate.status,
                  );
                  return (
                    <div
                      key={gate.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950"
                    >
                      <span className="font-bold text-slate-300 text-xs uppercase">
                        {gate.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-2">
                Snacks
              </h4>
              <div className="space-y-2">
                {snacks.map((snack) => {
                  const status = getStatusText(
                    snack.currentCount,
                    snack.capacity,
                    snack.status,
                  );
                  return (
                    <div
                      key={snack.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950"
                    >
                      <span className="font-bold text-slate-300 text-xs uppercase">
                        {snack.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1 min-h-[250px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            Live Broadcasts <AlertTriangle className="w-4 h-4 text-red-500" />
          </h3>
          <div className="flex-1 flex flex-col">
            {userMessages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                No active broadcasts.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg relative overflow-hidden"
                  >
                    <h4 className="text-xs font-bold text-red-100 uppercase tracking-wide">
                      {msg.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{msg.content}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
