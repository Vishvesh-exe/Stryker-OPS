import { useState, useEffect } from "react";
import { ShieldCheck, User as UserIcon, LogIn, Github } from "lucide-react";
import { useAppStore } from "../store";
import { motion } from "motion/react";

export default function Login() {
  const { setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<
    "admin" | "fan" | "security" | null
  >(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (
        !origin.endsWith(".run.app") &&
        !origin.includes("localhost") &&
        origin !== window.location.origin
      ) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const storedRole =
          (localStorage.getItem("pendingRole") as
            | "admin"
            | "fan"
            | "security") || "fan";
        // In a real app we'd decode token / fetch user from our backend
        setUser({
          id: `usr-${Date.now()}`,
          name:
            storedRole === "admin"
              ? "Command Admin"
              : storedRole === "security"
                ? "Security Staff"
                : "Stadium Fan",
          role: storedRole,
        });
        setLoading(false);
        localStorage.removeItem("pendingRole");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setUser]);

  const handleLogin = async (role: "admin" | "fan" | "security") => {
    setLoading(true);
    setErrorObj(null);
    setPendingRole(role);
    localStorage.setItem("pendingRole", role);

    try {
      const response = await fetch("/api/auth/url");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            "Failed to get auth URL. Check missing ENV variables or server status.",
        );
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700",
      );

      if (!authWindow) {
        setErrorObj(
          "Popup blocked. Please allow popups to sign in with Github.",
        );
        setLoading(false);
      }
    } catch (error: any) {
      console.error("OAuth error:", error);
      setErrorObj(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
      >
        <div className="bg-[#0f172a] border-b border-slate-800 p-8 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 mb-4 shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              System Login
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">
            STRYKER OPS
          </h1>
          <p className="text-slate-500 text-xs mt-2 font-mono">
            Authenticate to standard OAuth identity provider
          </p>
        </div>

        <div className="p-8 space-y-6">
          {errorObj && (
            <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-xs text-center font-mono break-words">
              {errorObj}
              <br />
              <span className="text-red-400 opacity-80 mt-1 block">
                Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in
                variables workspace.
              </span>
            </div>
          )}

          <div className="space-y-3 relative z-10">
            <button
              onClick={() => handleLogin("fan")}
              disabled={loading}
              className="w-full relative group flex items-center justify-between px-5 py-4 border border-slate-800 hover:border-blue-500/50 rounded-xl bg-slate-950 text-slate-300 transition-all font-medium disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors border border-blue-500/20">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="block text-slate-200 text-sm font-bold uppercase tracking-wider">
                    Fan Access
                  </span>
                  <span className="block text-[10px] text-slate-500 font-normal uppercase tracking-wide mt-1">
                    Authenticate via Github OAuth
                  </span>
                </div>
              </div>
              <Github className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </button>

            <button
              onClick={() => handleLogin("admin")}
              disabled={loading}
              className="w-full relative group flex items-center justify-between px-5 py-4 border border-slate-800 hover:border-indigo-500/50 rounded-xl bg-slate-950 text-slate-300 transition-all font-medium disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="block text-slate-200 text-sm font-bold uppercase tracking-wider">
                    Command Control
                  </span>
                  <span className="block text-[10px] text-slate-500 font-normal uppercase tracking-wide mt-1">
                    Authenticate via Github OAuth
                  </span>
                </div>
              </div>
              <Github className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>
            <button
              onClick={() => handleLogin("security")}
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-left">
                  <span className="block text-slate-200 text-sm font-bold uppercase tracking-wider">
                    Security Staff
                  </span>
                  <span className="block text-[10px] text-slate-500 font-normal uppercase tracking-wide mt-1">
                    Authenticate via Github OAuth
                  </span>
                </div>
              </div>
              <Github className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
