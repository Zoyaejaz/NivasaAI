"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, LogOut, ArrowLeft, Activity, Calendar, 
  AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Sparkles,
  Menu, X, ClipboardList, ChevronDown, ChevronUp
} from "lucide-react";
import LogoIcon from "@/components/LogoIcon";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminAssets() {
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [expandedAssetId, setExpandedAssetId] = useState<number | null>(null);
  
  // Mobile navigation drawer toggle
  const [menuOpen, setMenuOpen] = useState(false);
  
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text font-sans">
        <div className="flex flex-col items-center gap-3 bg-surface p-6 rounded border border-border shadow-2xs">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold text-muted-text">Loading Asset Risk Ledger...</span>
        </div>
      </div>
    );
  }

  // Common Nav list render
  const renderNavLinks = () => (
    <nav className="space-y-1">
      <Link 
        href="/dashboard/admin" 
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-text hover:text-primary rounded-r transition-colors"
      >
        <ClipboardList className="w-4 h-4 text-muted-text" />
        <span>Operations Console</span>
      </Link>
      <Link 
        href="/dashboard/admin/assets" 
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-primary bg-background border-l-2 border-l-primary rounded-r transition-colors"
      >
        <Activity className="w-4 h-4 text-primary" />
        <span>Infrastructure Risk Ledger</span>
      </Link>
    </nav>
  );

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-background text-text font-sans">
      
      {/* Background decoration grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-surface border-r border-border h-screen sticky top-0 z-20 shrink-0 justify-between p-5 shadow-3xs">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1.5 border-b border-border/40 pb-4">
            <div className="p-1.5 bg-primary rounded flex items-center justify-center">
              <LogoIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight text-primary">
              Nivasa<span className="font-sans font-normal text-secondary italic ml-0.5">AI</span>
            </span>
          </div>
          
          <div className="space-y-2">
            <span className="block text-[9px] uppercase font-bold text-muted-text tracking-widest px-2 mb-2">Navigation</span>
            {renderNavLinks()}
          </div>
        </div>

        {/* Desktop Profile / Logout Section */}
        <div className="border-t border-border/40 pt-4 mt-auto space-y-3.5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-text truncate leading-none">{user?.full_name}</div>
              <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Property Administrator</div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-text hover:text-status-danger hover:bg-background rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Banner */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-border px-4 py-3 sticky top-0 z-40 shadow-3xs">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-4 h-4 text-primary" />
          <span className="font-serif font-bold text-sm tracking-tight text-primary">Nivasa<span className="font-sans font-normal text-secondary italic">AI</span></span>
        </div>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="p-1.5 text-muted-text hover:text-primary hover:bg-background/50 rounded transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Sidebar */}
      {menuOpen && (
        <>
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/25 z-40 backdrop-blur-3xs md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 p-5 flex flex-col justify-between shadow-lg md:hidden animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <LogoIcon className="w-4 h-4 text-primary" />
                  <span className="font-serif font-bold text-sm tracking-tight text-primary">Nivasa<span className="font-sans font-normal text-secondary italic">AI</span></span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="text-muted-text hover:text-primary p-1">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="block text-[9px] uppercase font-bold text-muted-text tracking-widest px-2 mb-2">Navigation</span>
                {renderNavLinks()}
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3.5">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-text truncate leading-none">{user?.full_name}</div>
                  <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Property Administrator</div>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-text hover:text-status-danger hover:bg-background rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
          
          {/* Title Section */}
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-xl font-bold font-serif text-primary flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-primary/85" /> Infrastructure Assets & Risk Index
            </h2>
            <p className="text-xs text-muted-text mt-1.5 font-medium leading-relaxed max-w-xl">
              Dynamic health scores and early degradation logs calculated continuously based on asset age, maintenance schedule adherence, and service request frequency.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden border border-border rounded shadow-2xs bg-surface font-sans">
            <table className="w-full text-xs text-left">
              <thead className="table-header text-[9px] font-bold">
                <tr>
                  <th className="px-4 py-3">Infrastructure Asset</th>
                  <th className="px-4 py-3 w-36">Location Area</th>
                  <th className="px-4 py-3 w-28">Installed Date</th>
                  <th className="px-4 py-3 w-28">Last Inspected</th>
                  <th className="px-4 py-3 w-24">Health Rating</th>
                  <th className="px-4 py-3 w-28 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-text">
                {assets.map((asset) => {
                  const active = expandedAssetId === asset.id;
                  const isHighRisk = asset.risk_level === "High";
                  const isMediumRisk = asset.risk_level === "Medium";
                  
                  return (
                    <Fragment key={asset.id}>
                      <tr 
                        onClick={() => setExpandedAssetId(active ? null : asset.id)}
                        className="hover:bg-background/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text group-hover:text-primary transition-colors">{asset.name}</span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-background text-muted-text border border-border font-bold uppercase tracking-wider">
                              {asset.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-text font-semibold">{asset.location}</td>
                        <td className="px-4 py-3.5 text-muted-text font-semibold">{new Date(asset.install_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5 text-muted-text font-semibold">{new Date(asset.last_maintenance_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5">
                          <span className={`font-bold ${isHighRisk ? 'text-status-danger' : isMediumRisk ? 'text-status-warning' : 'text-status-success'}`}>
                            {asset.health_score}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider inline-block ${
                              isHighRisk 
                                ? "bg-status-danger/5 text-status-danger border-status-danger/15" 
                                : isMediumRisk 
                                  ? "bg-status-warning/5 text-status-warning border-status-warning/15" 
                                  : "bg-status-success/5 text-status-success border-status-success/15"
                            }`}>
                              {asset.risk_level}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedAssetId(active ? null : asset.id);
                              }}
                              className="p-1 hover:bg-background rounded transition-colors"
                            >
                              {active ? <ChevronUp className="w-3.5 h-3.5 text-muted-text" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-text" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {active && (
                        <tr className="bg-background/20 animate-in fade-in duration-100">
                          <td colSpan={6} className="px-5 py-4 border-l-2 border-l-primary/60">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              <div className="grid grid-cols-2 gap-4 bg-surface border border-border p-4 rounded shadow-3xs text-xs font-semibold text-muted-text">
                                <div>
                                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">Health Rating</span>
                                  <span className={`text-xl font-serif font-bold mt-1 block ${isHighRisk ? 'text-status-danger' : isMediumRisk ? 'text-status-warning' : 'text-status-success'}`}>{asset.health_score}%</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">Degradation Index</span>
                                  <span className="text-xl font-serif font-bold text-text mt-1 block">{asset.risk_score}%</span>
                                </div>
                              </div>
                              
                              <div className={`p-4 rounded border text-xs leading-relaxed flex items-start gap-2.5 shadow-3xs ${
                                isHighRisk 
                                  ? "bg-status-danger/5 border-status-danger/15 text-status-danger" 
                                  : isMediumRisk 
                                    ? "bg-status-warning/5 border-status-warning/15 text-text" 
                                    : "bg-status-success/5 border-status-success/15 text-primary"
                              }`}>
                                {isHighRisk ? (
                                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-status-danger" />
                                ) : isMediumRisk ? (
                                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-status-warning" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-status-success" />
                                )}
                                <div>
                                  <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5">
                                    <Sparkles className="w-3.5 h-3.5 text-primary/80" /> Operations Care Protocol:
                                  </span>
                                  <span className="block mt-0.5 opacity-90 font-medium font-sans">
                                    {asset.risk_level === 'High' 
                                      ? 'CRITICAL URGENT ACTION: Direct maintenance required immediately due to recurring service requests and degradation levels.' 
                                      : asset.risk_level === 'Medium' 
                                        ? 'INSPECTION ADVISED: Add to preventive checks queue for the upcoming week to prevent water or power service outages.' 
                                        : 'STANDBY: Operational indicators normal. Continue routine scheduled checks.'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {assets.map((asset) => {
              const isHighRisk = asset.risk_level === "High";
              const isMediumRisk = asset.risk_level === "Medium";
              
              return (
                <div key={asset.id} className="p-4 bg-surface border border-border rounded shadow-3xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold text-primary">{asset.category}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                      isHighRisk 
                        ? "bg-status-danger/5 text-status-danger border-status-danger/15" 
                        : isMediumRisk 
                          ? "bg-status-warning/5 text-status-warning border-status-warning/15" 
                          : "bg-status-success/5 text-status-success border-status-success/15"
                    }`}>
                      {asset.risk_level} Risk
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-text">{asset.name}</h4>
                    <p className="text-[10px] text-muted-text mt-0.5 font-semibold">{asset.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-background/50 border border-border p-2.5 rounded text-xs font-semibold text-muted-text">
                    <div>
                      <span className="text-[9px] block">Health Score</span>
                      <span className={`font-serif font-bold text-sm block mt-0.5 ${isHighRisk ? 'text-status-danger' : isMediumRisk ? 'text-status-warning' : 'text-status-success'}`}>{asset.health_score}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] block">Degradation Rate</span>
                      <span className="font-serif font-bold text-sm text-text block mt-0.5">{asset.risk_score}%</span>
                    </div>
                  </div>

                  <div className="text-[10px] leading-relaxed text-muted-text font-medium bg-background/30 p-2.5 border border-border/40 rounded">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-primary block mb-0.5">Protocol Note</span>
                    {asset.risk_level === 'High' 
                      ? 'CRITICAL URGENT ACTION: Direct maintenance required immediately.' 
                      : asset.risk_level === 'Medium' 
                        ? 'INSPECTION ADVISED: Add to preventive checks queue.' 
                        : 'STANDBY: Operational indicators normal.'
                    }
                  </div>

                  <div className="text-[9px] text-muted-text font-bold border-t border-border/40 pt-2 flex justify-between">
                    <span>Installed: {new Date(asset.install_date).toLocaleDateString()}</span>
                    <span>Last Inspected: {new Date(asset.last_maintenance_date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}
