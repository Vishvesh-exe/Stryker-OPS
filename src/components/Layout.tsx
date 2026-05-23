import React from "react";
import { useAppStore } from "../store";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    stadiums,
    selectedStadiumId,
    setSelectedStadiumId,
    activeStadium,
  } = useAppStore();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <header className="h-16 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${user.role === "admin" ? "bg-red-500" : "bg-blue-500"}`}
            ></div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden sm:inline">
              {user.role === "admin" ? "COMMAND LIVE" : "FAN LIVE"}
            </span>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent ml-2 uppercase">
              STRYKER OPS
            </h1>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Stadium:</span>
            <select
              value={selectedStadiumId}
              onChange={(e) => setSelectedStadiumId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-sm font-semibold rounded px-2 py-1 text-white outline-none focus:border-blue-500 transition-colors"
            >
              {stadiums.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-tighter italic">
            Syncing: Live
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user.name}</p>
            </div>
            <button
              onClick={() => setUser(null)}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Stadium Selector */}
      <div className="md:hidden p-4 border-b border-slate-800 bg-[#0f172a]">
        <select
          value={selectedStadiumId}
          onChange={(e) => setSelectedStadiumId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-sm font-semibold rounded p-2 text-white outline-none focus:border-blue-500 transition-colors"
        >
          {stadiums.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}, {s.location}
            </option>
          ))}
        </select>
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {activeStadium && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">
                {activeStadium.location}
              </h2>
              <p className="text-xl font-bold text-slate-200">
                {activeStadium.name}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {activeStadium.description}
              </p>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
