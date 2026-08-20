"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Brain, User, LogOut, CheckCircle, Clock, Info, AlertTriangle, 
  Search, Filter, ArrowUpDown, ChevronRight, Activity, Send, MessageSquare, 
  RefreshCw, ClipboardList, ShieldAlert, Sparkles, UserCheck, Bell
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  
  // Update complaint dialog/status state
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("Open");
  const [updatePriority, setUpdatePriority] = useState("Medium");
  const [updateComment, setUpdateComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Chat Copilot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: "assistant", text: "Hello Admin! I'm Nivasa AI Copilot. Ask me anything about society complaints, notice board, or high-risk assets." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

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
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      router.push("/dashboard/resident");
      return;
    }
    
    setUser(parsedUser);
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      // 1. Fetch Analytics
      const resAnalytics = await fetch(`${API_BASE_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resAnalytics.ok) {
        setAnalytics(await resAnalytics.json());
      }
      
      // 2. Fetch Complaints
      const resComplaints = await fetch(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resComplaints.ok) {
        setComplaints(await resComplaints.json());
      }

      // 3. Fetch Assets
      const resAssets = await fetch(`${API_BASE_URL}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resAssets.ok) {
        setAssets(await resAssets.json());
      }

      // 4. Fetch Notifications
      const resNotis = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resNotis.ok) {
        setNotifications(await resNotis.json());
      }
    } catch (err) {
      console.error("Error loading admin dashboard data", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdateLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/${selectedComplaint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateStatus,
          priority: updatePriority,
          comment: updateComment || "Field values updated by administrator"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update complaint fields");
      }

      setSelectedComplaint(null);
      setUpdateComment("");
      fetchData(token);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage.trim();
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setChatMessage("");
    setChatLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.ok) {
        throw new Error("AI Assistant failed to reply");
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        text: data.response, 
        actions: data.suggested_actions 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        text: "I experienced an error compiling records. Please check the local network console connection." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-zinc-400">Loading Admin Dashboard...</span>
      </div>
    );
  }

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    const searchPattern = search.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(searchPattern) ||
      c.description.toLowerCase().includes(searchPattern) ||
      c.location.toLowerCase().includes(searchPattern);
      
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const highRiskAssetsCount = assets.filter(a => a.risk_level === "High").length;

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
          <Link href="/dashboard/admin/assets" className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Asset Riskscoring
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

      {/* Main Admin Grid */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Complaints</span>
              <ClipboardList className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">{analytics?.total_complaints}</div>
            <div className="text-[10px] text-zinc-500 mt-2">Active complaints: {analytics?.active_complaints}</div>
          </div>

          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SLA Compliance</span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{analytics?.sla_compliance_rate}%</div>
            <div className="text-[10px] text-zinc-500 mt-2">Avg resolution: {analytics?.avg_resolution_time_hours} hours</div>
          </div>

          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">High Risk Assets</span>
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-red-400">{highRiskAssetsCount}</div>
            <div className="text-[10px] text-zinc-500 mt-2">Critical infrastructure items requiring checks</div>
          </div>

          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overdue Complaints</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-extrabold text-yellow-400">{analytics?.overdue_complaints}</div>
            <div className="text-[10px] text-zinc-500 mt-2">Exceeded 48-hour SLA period</div>
          </div>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Categories distribution */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4">Complaint Categories</h3>
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.category_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) => `${props.category || ""} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {analytics?.category_distribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: 30-Day Predictive Forecasting */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-500" /> Predictive Volume Forecast (Next 30 Days)
            </h3>
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.forecast_30_days}>
                  <XAxis dataKey="date" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Complaints Manager Table */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white">Operational Service Tickets</h3>
            
            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 pl-3 flex items-center w-4 h-4 text-zinc-500 mt-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, location..."
                  className="pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs placeholder-zinc-700 focus:outline-none focus:border-blue-500 text-white w-48"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Elevator">Elevator</option>
                <option value="Security">Security</option>
                <option value="Cleanliness">Cleanliness</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-900 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950/60 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Ticket Details</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Resident</th>
                  <th className="px-4 py-3">AI Diagnostics</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/20 transition-all">
                    <td className="px-4 py-4 font-bold text-zinc-500">#{c.id}</td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-bold text-white">{c.title}</div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">{c.description}</div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-zinc-300">{c.category}</td>
                    <td className="px-4 py-4 text-zinc-400">{c.location}</td>
                    <td className="px-4 py-4">
                      <div className="text-white font-semibold">{c.resident.full_name}</div>
                      <div className="text-[10px] text-zinc-500">{c.resident.flat_number}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold text-white">{(c.ai_confidence_score * 100).toFixed(0)}%</span>
                      </div>
                      {c.is_recurring && (
                        <div className="inline-flex items-center gap-1 text-[9px] text-yellow-400/90 font-bold mt-1 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                          <AlertTriangle className="w-3 h-3" /> Recurring
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${c.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : c.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold border uppercase tracking-wider ${c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-950 text-zinc-400 border-zinc-900'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setUpdateStatus(c.status);
                          setUpdatePriority(c.priority);
                        }}
                        className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-900 rounded-lg text-[10px] font-semibold text-zinc-300 hover:text-white transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-zinc-600 py-8">
                      No complaints matched the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all shadow-blue-500/30"
        >
          <Brain className="w-6 h-6 animate-pulse" />
        </button>

        {/* AI Assistant Chat Panel */}
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-96 bg-zinc-900 border border-zinc-800 rounded-2xl glass shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-white">Nivasa AI Assistant</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-400" /> Operational Context Mode</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-zinc-500 hover:text-white text-xs">Close</button>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs space-y-2 leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-950/80 border border-zinc-900 text-zinc-300 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Suggested Action Tags */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 border-t border-zinc-900/60 pt-2 mt-2">
                        {msg.actions.map((act: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setChatMessage(act);
                            }}
                            className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10 rounded text-[9px] font-semibold transition-all"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs text-zinc-500">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-500" /> Computing response...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about assets, complaints, recurring issues..."
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-white"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Update Complaint Modal Dialog */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md glass shadow-2xl relative">
            <h4 className="text-base font-bold text-white mb-1">Manage Complaint #{selectedComplaint.id}</h4>
            <p className="text-[11px] text-zinc-500 mb-6">{selectedComplaint.title}</p>
            
            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Set Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Override Priority</label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Audit Transition Comment</label>
                <textarea
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  rows={3}
                  placeholder="Provide audit notes explaining the change. (e.g. 'Dispatched plumbers to repair joint. Rechecked pressure.')"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
                >
                  {updateLoading && <RefreshCw className="w-3 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
