"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Brain, User, LogOut, CheckCircle, Clock, Info, AlertTriangle, 
  Plus, MessageSquare, Image, Send, Bell, ClipboardList, AlertCircle, RefreshCw
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResidentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Create complaint form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  
  // AI Preview State
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      // 1. Fetch complaints
      const resComplaints = await fetch(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resComplaints.ok) {
        setComplaints(await resComplaints.json());
      }
      
      // 2. Fetch notices
      const resNotices = await fetch(`${API_BASE_URL}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resNotices.ok) {
        setNotices(await resNotices.json());
      }

      // 3. Fetch notifications
      const resNotis = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resNotis.ok) {
        setNotifications(await resNotis.json());
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Run a preview check against back-end logic to predict attributes
  const handleAIValidation = async () => {
    if (!title || !description) {
      setError("Please fill out the title and description to run AI validation.");
      return;
    }
    setError("");
    setAnalyzing(true);
    setAiPreview(null);
    
    try {
      // Simulate quick predictor call or hit backend helper if we want.
      // We can hit a small mock/custom calculation since predict_complaint_attributes runs on python.
      // Let's create a temp prediction on the client using key terms matching our backend ML training preset!
      const descLower = description.lower ? description.toLowerCase() : "";
      const titleLower = title.lower ? title.toLowerCase() : "";
      const full = `${titleLower} ${descLower}`;
      
      let predictedCat = "Plumbing";
      let predictedPriority = "Medium";
      let confidence = 0.85;
      let expl = "Predicted using keywords and structural analysis.";
      
      if (full.includes("spark") || full.includes("electric") || full.includes("power") || full.includes("wire")) {
        predictedCat = "Electrical";
        predictedPriority = full.includes("spark") || full.includes("power") ? "High" : "Low";
        expl = "AI detected electrical triggers ('spark', 'wire') indicating high priority fire safety concerns.";
      } else if (full.includes("leak") || full.includes("water") || full.includes("pipe") || full.includes("clog")) {
        predictedCat = "Plumbing";
        predictedPriority = full.includes("flood") || full.includes("leak") ? "High" : "Medium";
        expl = "AI detected fluid flow indicators ('leak', 'pipe') requiring plumbing response.";
      } else if (full.includes("elevator") || full.includes("lift") || full.includes("stuck") || full.includes("shak")) {
        predictedCat = "Elevator";
        predictedPriority = "High";
        expl = "AI identified elevator safety failure risks, recommending immediate mechanic dispatch.";
      } else if (full.includes("garbage") || full.includes("clean") || full.includes("dust") || full.includes("waste")) {
        predictedCat = "Cleanliness";
        predictedPriority = "Low";
        expl = "Routine cleanup and refuse accumulation matching low priority maintenance tracks.";
      } else if (full.includes("guard") || full.includes("lock") || full.includes("cctv") || full.includes("security")) {
        predictedCat = "Security";
        predictedPriority = full.includes("broken") || full.includes("sleeping") ? "High" : "Medium";
        expl = "Access control or monitoring asset alert. Categorized as critical security.";
      }

      setAiPreview({
        category: predictedCat,
        priority: predictedPriority,
        confidence,
        explanation: expl
      });
      // Fill the category dropdown based on AI recommendation
      setCategory(predictedCat);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          photo_url: photoUrl || null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to file complaint");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setPhotoUrl("");
      setAiPreview(null);
      
      // Refresh
      fetchData(token);
    } catch (err: any) {
      setError(err.message || "Failed to file complaint. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(token);
    } catch (err) {
      console.error(err);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-zinc-400">Loading Resident Portal...</span>
      </div>
    );
  }

  const unreadNotis = notifications.filter(n => !n.is_read);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col z-10">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-900/30 glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span className="font-bold tracking-tight text-white">Nivasa<span className="text-blue-500">AI</span></span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest font-semibold ml-2">Resident</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications dropdown mock */}
          <div className="relative group">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              {unreadNotis.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </button>
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-4 hidden group-hover:block glass z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-white">Recent Alerts</span>
                {unreadNotis.length > 0 && (
                  <button onClick={handleMarkNotificationsRead} className="text-[10px] text-blue-400 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center text-xs text-zinc-600 py-4">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-lg border text-xs transition-all ${n.is_read ? 'bg-transparent border-zinc-900 text-zinc-500' : 'bg-blue-500/5 border-blue-900/20 text-zinc-300'}`}>
                      <div className="font-semibold text-white mb-0.5">{n.title}</div>
                      <div>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-none">{user?.full_name}</div>
              <div className="text-[10px] text-zinc-500 leading-none mt-1">{user?.flat_number}</div>
            </div>
          </div>

          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Notices & Stats (cols-4) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Active Notices Board */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" /> Notice Board
            </h3>
            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n.id} className={`p-4 rounded-xl border transition-all ${n.is_pinned ? 'bg-blue-500/5 border-blue-500/20' : 'bg-zinc-950/40 border-zinc-900'}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    {n.is_pinned && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">Pinned</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{n.content}</p>
                </div>
              ))}
              {notices.length === 0 && (
                <div className="text-center text-xs text-zinc-600 py-6">No notices active</div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Side: Create Complaint & History (cols-8) */}
        <main className="lg:col-span-8 space-y-8">
          
          {/* File a Complaint */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> File a New Complaint
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Our local NLP model will predict priority and category automatically upon request.</p>
            
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-900/40 rounded-xl text-red-400 text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Complaint Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Clogged sink drain"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Location / Flat</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Kitchen bathroom, Wing A 504"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe the problem in detail. (e.g. 'Water is leaking from the joint under the sink and flooding the floor...')"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                />
              </div>

              {/* Photo Input (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Complaint Photo URL (Optional Mock)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste a simulated photo filename (e.g. leak.jpg, spark.jpg) to test AI photo scanning diagnostics"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>

              {/* AI Suggestions Box */}
              {aiPreview && (
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-blue-500" /> AI Insights Preview
                    </span>
                    <span className="text-[10px] text-zinc-500">Confidence: {(aiPreview.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">Predicted Category:</span>{" "}
                      <span className="font-bold text-blue-400">{aiPreview.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Predicted Priority:</span>{" "}
                      <span className={`font-bold ${aiPreview.priority === 'High' ? 'text-red-400' : aiPreview.priority === 'Medium' ? 'text-yellow-400' : 'text-zinc-400'}`}>
                        {aiPreview.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed italic mt-1 border-t border-zinc-900 pt-2">{aiPreview.explanation}</p>
                </div>
              )}

              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={handleAIValidation}
                  disabled={analyzing}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Brain className="w-3.5 h-3.5 text-blue-400" />}
                  {analyzing ? "AI Analyzing..." : "Run AI Diagnostics"}
                </button>
                
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> File Complaint
                </button>
              </div>
            </form>
          </div>

          {/* Complaints History */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" /> Track My Complaints
            </h3>
            
            {complaints.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-900 rounded-2xl text-center text-sm text-zinc-600">
                You have not filed any complaints yet. Use the form above to post one.
              </div>
            ) : (
              complaints.map((c) => (
                <div key={c.id} className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass space-y-4">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-900 pb-4">
                    <div>
                      <span className="text-xs font-bold text-zinc-400">COMPLAINT #{c.id}</span>
                      <h4 className="text-sm font-extrabold text-white mt-1">{c.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Priority Tag */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${c.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : c.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                        {c.priority}
                      </span>
                      {/* Status Tag */}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border uppercase tracking-wider ${c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-950 text-zinc-400 border-zinc-900'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="text-xs space-y-2">
                    <p className="text-zinc-300 leading-relaxed">{c.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-zinc-500 py-1">
                      <div><span className="font-semibold text-zinc-400">Location:</span> {c.location}</div>
                      <div><span className="font-semibold text-zinc-400">Category:</span> {c.category}</div>
                    </div>
                  </div>

                  {/* AI Diagnostic details */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mb-1">
                      <Brain className="w-3.5 h-3.5 text-blue-500" /> AI Diagnostic Report
                    </div>
                    <div>
                      <span className="text-zinc-500">Confidence Score:</span>{" "}
                      <span className="font-semibold text-white">{(c.ai_confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Recommendation / Explanation:</span>{" "}
                      <span className="text-zinc-400">{c.ai_explanation}</span>
                    </div>
                    {c.is_recurring && (
                      <div className="text-yellow-400/90 flex items-center gap-1 mt-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Recurring issue: linked to master ticket #{c.parent_recurring_complaint_id}
                      </div>
                    )}
                  </div>

                  {/* Timeline Tracker */}
                  <div className="border-t border-zinc-900 pt-4 space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">History & Lifecycle Timeline</h5>
                    <div className="space-y-3">
                      {c.history.map((h: any) => (
                        <div key={h.id} className="relative pl-4 border-l border-zinc-800 text-xs">
                          <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-zinc-700" />
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold mb-0.5">
                            <span>{h.status_from} &rarr; {h.status_to}</span>
                            <span>{new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed">{h.comment}</p>
                          <div className="text-[10px] text-zinc-600 mt-0.5">Action by: {h.changed_by.full_name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
