import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import StadiumVisual from "./StadiumVisual";
import { Terminal, Shield, Bell, ScanLine, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SecurityDashboard() {
  const { messages, activeStadium } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<"success" | "failure" | null>(
    null,
  );

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setScanResult(Math.random() > 0.1 ? "success" : "failure");
        setIsScanning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => setScanResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  if (!activeStadium) return null;

  const securityMessages = messages.filter(
    (m) => m.target === "all" || m.target === "security",
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Stadium Overview */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px]">
        <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Security Overview
            </h2>
            <div className="text-sm text-slate-500 font-mono mt-1">
              Live Crowd Distribution & Bottlenecks
            </div>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden relative">
          <StadiumVisual />
        </div>
      </div>

      {/* Right Column - Announcements & Alerts */}
      <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        {/* Access Verification scanner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-emerald-400" /> Access
            Verification
          </h3>
          <div className="flex flex-col items-center justify-center py-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isScanning && !scanResult) setIsScanning(true);
              }}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 transition-colors ${
                isScanning
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 border-dashed"
                  : scanResult === "success"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : scanResult === "failure"
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400"
              }`}
            >
              <AnimatePresence mode="wait">
                {isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ScanLine className="w-8 h-8 mb-2" />
                  </motion.div>
                ) : scanResult === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                ) : scanResult === "failure" ? (
                  <motion.div
                    key="failure"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <span className="text-3xl font-bold">X</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <ScanLine className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Scan
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <div className="mt-4 h-6">
              <AnimatePresence mode="wait">
                {scanResult === "success" && (
                  <motion.p
                    key="msg-success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-green-400 text-sm font-bold uppercase tracking-widest"
                  >
                    Pass Validated. Access Granted.
                  </motion.p>
                )}
                {scanResult === "failure" && (
                  <motion.p
                    key="msg-fail"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm font-bold uppercase tracking-widest"
                  >
                    Invalid Pass ID.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-5 flex flex-col flex-1 max-h-[500px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" /> Latest Announcements
          </h3>
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
            {securityMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-600 font-mono text-xs">
                No active announcements
              </div>
            ) : (
              securityMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col gap-2 relative"
                >
                  <div className="flex justify-between items-center absolute -top-2 left-2 px-1 bg-slate-950 rounded border border-slate-800">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">
                      {msg.title}
                    </span>
                  </div>
                  <div className="text-slate-200 text-sm mt-1">
                    {msg.content}
                  </div>
                  <div className="text-slate-600 text-[10px] font-mono self-end">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
