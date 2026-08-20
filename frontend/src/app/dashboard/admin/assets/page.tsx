"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Brain, User, LogOut, ArrowLeft, Activity, Tool, Calendar, 
  AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Sparkles
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminAssets() {
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      router.push("/dashboard/resident");
      return;
    }
    
    setUser(parsedUser);
    fetchAssets(token);
  }, []);

  const fetchAssets = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setAssets(await response.json());
      }
    } catch (err) {
      console.error("Error loading assets", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-zinc-400">Loading Assets Risk scoring...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col z-10">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-900/30 glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span className="font-bold tracking-tight text-white">Nivasa<span className="text-blue-500">AI</span></span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-semibold ml-2">Admin Command Center</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-6">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-none">{user?.full_name}</div>
              <div className="text-[10px] text-zinc-500 leading-none mt-1">Platform Admin</div>
            </div>
          </div>

          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Title Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" /> Asset Health & Risk scoring
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Predictive maintenance diagnostics calculated dynamically based on ages, operational complaint frequencies, and maintenance logs.</p>
          </div>
        </div>

        {/* Asset Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => {
            const isHighRisk = asset.risk_level === "High";
            const isMediumRisk = asset.risk_level === "Medium";
            
            return (
              <div key={asset.id} className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass flex flex-col justify-between space-y-6">
                
                {/* Top Section */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700 uppercase tracking-wider">
                      {asset.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-2">{asset.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{asset.location}</p>
                  </div>
                  
                  {/* Risk Level Badge */}
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-bold border uppercase tracking-wider ${
                    isHighRisk 
                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                      : isMediumRisk 
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {asset.risk_level} Risk
                  </span>
                </div>

                {/* Health & Risk Metrics */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Health Score</span>
                    <div className={`text-2xl font-black mt-1 ${
                      isHighRisk ? "text-red-400" : isMediumRisk ? "text-yellow-400" : "text-emerald-400"
                    }`}>
                      {asset.health_score}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Calculated Risk</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {asset.risk_score}%
                    </div>
                  </div>
                </div>

                {/* Date specifications */}
                <div className="text-xs text-zinc-500 space-y-1.5 border-t border-zinc-900/60 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Installed: {new Date(asset.install_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Last Maintained: {new Date(asset.last_maintenance_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Diagnostic Recommendation */}
                <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  isHighRisk 
                    ? "bg-red-950/20 border-red-900/20 text-red-300" 
                    : isMediumRisk 
                      ? "bg-yellow-950/20 border-yellow-900/20 text-yellow-300" 
                      : "bg-emerald-950/20 border-emerald-900/20 text-emerald-300"
                }`}>
                  {isHighRisk ? (
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400 animate-pulse" />
                  ) : isMediumRisk ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  )}
                  <div>
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" /> AI Recommendation:
                    </span>
                    <span className="block mt-0.5 opacity-90">
                      {asset.risk_level === 'High' 
                        ? 'CRITICAL: Urgent maintenance requested. Multiple complaints filed or long service interval.' 
                        : asset.risk_level === 'Medium' 
                          ? 'RECOMMENDED: Plan inspections in next 14 days. Age decay or minor pending issues.' 
                          : 'Normal operations. Scheduled checks.'
                      }
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
