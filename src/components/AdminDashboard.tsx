import { useAppStore } from "../store";
import StadiumVisual from "./StadiumVisual";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ShieldAlert, Radio, CloudLightning } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const {
    activeStadium,
    updateZoneStatus,
    sendMessage,
    weather,
    executeReroutePlan,
    dismissWeatherAlert,
    isEvacuationMode,
    toggleEvacuationMode
  } = useAppStore();
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgTarget, setMsgTarget] = useState<"security" | "fans" | "all">(
    "fans",
  );

  if (!activeStadium) return null;

  const chartData = activeStadium.zones.map((z) => ({
    name: z.name,
    density: Math.round((z.currentCount / z.capacity) * 100),
    type: z.type,
    status: z.status,
  }));

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle || !msgContent) return;
    sendMessage(msgTitle, msgContent, msgTarget);
    setMsgTitle("");
    setMsgContent("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Main Command View */}
      <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
        {/* Weather Alerts / Auto Suggestions */}
        <AnimatePresence>
          {weather.alert && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className={`bg-red-900/20 border overflow-hidden ${weather.condition === "Heavy Rain" ? "border-orange-500/50 text-orange-400" : "border-red-500/50 text-red-500"} rounded-2xl p-4 flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                <CloudLightning className="w-4 h-4" /> Weather Alert:{" "}
                {weather.condition}
              </div>
              <div className="text-slate-300 text-sm">{weather.alert}</div>
              {weather.reroutePlan && (
                <div className="mt-2 p-3 bg-slate-950/50 rounded-lg border border-red-500/20">
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">
                    Suggested System Action
                  </div>
                  <div className="text-red-200 text-sm">
                    {weather.reroutePlan}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={executeReroutePlan}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] rounded transition-colors"
                    >
                      Execute Reroute
                    </button>
                    <button
                      onClick={dismissWeatherAlert}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold uppercase tracking-widest text-[10px] rounded transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Seating Cap", type: "seating" },
            { label: "Gate Load", type: "gate" },
            { label: "Snack Capacity", type: "snack" },
          ].map((metric) => {
            const zones = activeStadium.zones.filter(
              (z) => z.type === metric.type,
            );
            const cap = zones.reduce((acc, z) => acc + z.capacity, 0);
            const count = zones.reduce((acc, z) => acc + z.currentCount, 0);
            const util = cap > 0 ? Math.round((count / cap) * 100) : 0;
            return (
              <div
                key={metric.type}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
              >
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                  {metric.label}
                </h4>
                <div className="flex justify-between items-end">
                  <div className="text-xl font-bold text-slate-200">
                    {count.toLocaleString()}
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      / {cap.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${util > 85 ? "text-red-400" : util > 60 ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {util}%
                  </div>
                </div>
              </div>
            );
          })}

          {/* Parking Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
              Parking Status
            </h4>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-bold text-slate-200">
                  {
                    activeStadium.parkingSpots.filter((p) => p.isOccupied)
                      .length
                  }
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    Allocated
                  </span>
                </div>
                <div className="text-[10px] uppercase text-emerald-400 mt-1 font-bold tracking-wider">
                  {activeStadium.parkingSpots.filter((p) => p.isLocked).length}{" "}
                  Locked
                </div>
              </div>
              <div className={`text-xs font-mono font-bold text-blue-400`}>
                {Math.round(
                  (activeStadium.parkingSpots.filter((p) => p.isOccupied)
                    .length /
                    activeStadium.parkingSpots.length) *
                    100,
                )}
                %
              </div>
            </div>
          </div>
        </div>

        <StadiumVisual />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
            Density Analytics
            <span className="text-[10px] normal-case bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-bold uppercase tracking-tight">
              Live Sync
            </span>
          </h3>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1e293b"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    stroke="#334155"
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    stroke="#334155"
                  />
                  <Tooltip
                    cursor={{ fill: "#0f172a" }}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#38bdf8" }}
                  />
                  <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      let color = "#22c55e"; // green
                      if (entry.status === "closed")
                        color = "#475569"; // slate
                      else if (entry.density > 85)
                        color = "#ef4444"; // red
                      else if (entry.density > 60) color = "#eab308"; // yellow
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls Area */}
      <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
            Dynamic Map Routing
            <span className="text-[10px] text-slate-500 italic lowercase">
              Connected
            </span>
          </h3>
          <div className="flex justify-between items-center mb-4">
             <button onClick={toggleEvacuationMode} className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${isEvacuationMode ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse" : "bg-slate-950 text-slate-500 border-slate-800 hover:border-red-500/50 hover:text-slate-300"}`}>
               {isEvacuationMode ? "Cancel Evacuation" : "Initiate Evacuation Mode"}
             </button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {activeStadium.zones.map((zone) => {
              const density = Math.round(
                (zone.currentCount / zone.capacity) * 100,
              );
              return (
                <div
                  key={zone.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-300 text-xs uppercase">
                      {zone.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-1 rounded border ${density > 85 ? "text-red-400 border-red-500/30 bg-red-500/10" : density > 60 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-slate-400 border-slate-700 bg-slate-900"}`}
                    >
                      {density}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateZoneStatus(activeStadium.id, zone.id, "open")
                      }
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-colors ${zone.status === "open" ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-slate-900 text-slate-500 border-slate-700 hover:bg-slate-800"}`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() =>
                        updateZoneStatus(
                          activeStadium.id,
                          zone.id,
                          "redirecting",
                        )
                      }
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-colors ${zone.status === "redirecting" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : "bg-slate-900 text-slate-500 border-slate-700 hover:bg-slate-800"}`}
                    >
                      Redirect
                    </button>
                    <button
                      onClick={() =>
                        updateZoneStatus(activeStadium.id, zone.id, "closed")
                      }
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-colors ${zone.status === "closed" ? "bg-red-500/20 text-red-500 border-red-500/50" : "bg-slate-900 text-slate-500 border-slate-700 hover:bg-slate-800"}`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Communications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            Comms Link
            <Radio className="w-4 h-4 text-blue-500" />
          </h3>
          <form
            onSubmit={handleSendMsg}
            className="space-y-3 flex-1 flex flex-col"
          >
            <input
              type="text"
              value={msgTitle}
              onChange={(e) => setMsgTitle(e.target.value)}
              placeholder="Alert Title"
              required
              className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
            />
            <textarea
              value={msgContent}
              onChange={(e) => setMsgContent(e.target.value)}
              placeholder="Message payload..."
              required
              className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors flex-1 resize-none"
            ></textarea>
            <div className="flex gap-2 h-9 items-stretch">
              <select
                value={msgTarget}
                onChange={(e) => setMsgTarget(e.target.value as any)}
                className="text-[10px] font-bold uppercase tracking-wider px-2 bg-slate-950 border border-slate-800 text-slate-400 rounded outline-none focus:border-blue-500"
              >
                <option value="fans">Fans Map</option>
                <option value="security">Security</option>
                <option value="all">Global</option>
              </select>
              <button
                type="submit"
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-100 font-bold uppercase tracking-widest rounded transition-colors text-[10px] flex justify-center items-center gap-2"
              >
                <ShieldAlert className="w-3 h-3" /> Transmit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
