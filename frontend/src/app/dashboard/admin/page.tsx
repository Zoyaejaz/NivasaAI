"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, User, LogOut, CheckCircle, Clock, Info, AlertTriangle, 
  Search, Filter, Activity, Send, MessageSquare, 
  RefreshCw, ClipboardList, ShieldAlert, Sparkles, Bell,
  Menu, X, ChevronLeft, ChevronRight, Image as ImageIcon
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";
import ThemeToggle from "@/components/ThemeToggle";

// Consistent visual colors: Spruce Green, Muted Clay, and Slate Gray
const COLORS = ["#253C2C", "#7F624C", "#5B665E", "#8A948E", "#A07C64", "#D5D8D3"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Mobile navigation drawer toggle
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Update complaint dialog/status state
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("Open");
  const [updatePriority, setUpdatePriority] = useState("Medium");
  const [updateComment, setUpdateComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Tab Control State
  const [activeTab, setActiveTab] = useState("complaints");

  // Notice board management states
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePinned, setNoticePinned] = useState(false);
  const [noticeImportant, setNoticeImportant] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);

  // Chat Copilot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: "assistant", text: "Hello Admin! I'm the Nivasa Operations Assistant. Ask me anything about society complaints, notice board records, or critical assets requiring checks." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

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
        const fetchedComplaints = await resComplaints.json();
        setComplaints(fetchedComplaints);
        
        // Sync selected complaint details if active
        if (selectedComplaint) {
          const updated = fetchedComplaints.find((c: any) => c.id === selectedComplaint.id);
          if (updated) setSelectedComplaint(updated);
        }
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

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    setNoticeLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          is_pinned: noticePinned,
          is_important: noticeImportant
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create notice board bulletin");
      }

      setNoticeTitle("");
      setNoticeContent("");
      setNoticePinned(false);
      setNoticeImportant(false);
      fetchData(token);
    } catch (err) {
      console.error(err);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (!confirm("Are you sure you want to permanently delete this notice board bulletin?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notices/${noticeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete notice");
      }

      fetchData(token);
    } catch (err) {
      console.error(err);
    }
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
      setImgError(false);
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

  // Check if a ticket has exceeded the 48-hour SLA
  const isOverdue = (createdStr: string, status: string) => {
    if (status === "Resolved") return false;
    const createdDate = new Date(createdStr);
    const now = new Date();
    const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Get elapsed hours
  const getElapsedHours = (createdStr: string) => {
    const createdDate = new Date(createdStr);
    const now = new Date();
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset page on sort
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setStartDate("");
    setEndDate("");
    setOverdueOnly(false);
    setCurrentPage(1);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text font-sans">
        <div className="flex flex-col items-center gap-3 bg-surface p-6 rounded border border-border shadow-2xs">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold text-muted-text">Loading Operations Console...</span>
        </div>
      </div>
    );
  }

  // Filter complaints list dynamically
  const filteredComplaints = complaints.filter(c => {
    const searchPattern = search.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(searchPattern) ||
      c.description.toLowerCase().includes(searchPattern) ||
      c.location.toLowerCase().includes(searchPattern) ||
      c.resident.full_name.toLowerCase().includes(searchPattern) ||
      `#com-${1000 + c.id}`.includes(searchPattern);
      
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;
    
    // Overdue constraint
    const matchesOverdue = overdueOnly ? isOverdue(c.created_at, c.status) : true;
    
    // Date constraint
    const matchesStartDate = startDate ? new Date(c.created_at) >= new Date(startDate) : true;
    const matchesEndDate = endDate ? new Date(c.created_at) <= new Date(endDate + "T23:59:59") : true;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesOverdue && matchesStartDate && matchesEndDate;
  });

  // Sort complaints list dynamically
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "id") {
      comparison = a.id - b.id;
    } else if (sortBy === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "priority") {
      const priorityWeights: any = { High: 3, Medium: 2, Low: 1 };
      comparison = (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    } else {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Sliced items for client-side pagination
  const totalItems = sortedComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedComplaints = sortedComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate high-priority active tickets dynamically
  const unresolvedHighPriorityCount = complaints.filter(
    c => c.priority === "High" && c.status !== "Resolved"
  ).length;

  // Get date of last history transition, fallback to created_at
  const getLastUpdated = (c: any) => {
    if (c.history && c.history.length > 0) {
      return new Date(c.history[c.history.length - 1].created_at).toLocaleDateString();
    }
    return new Date(c.created_at).toLocaleDateString();
  };

  // Common Nav list render
  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      <button 
        onClick={() => {
          setActiveTab("overview");
          setMenuOpen(false);
          setSelectedComplaint(null);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded cursor-pointer ${
          activeTab === "overview" && !selectedComplaint
            ? "text-primary bg-background border-l-2 border-l-primary rounded-r font-bold"
            : "text-muted-text hover:text-primary hover:bg-background/50"
        }`}
      >
        <Building className="w-4.5 h-4.5" />
        <span>Overview Dashboard</span>
      </button>
      <button 
        onClick={() => {
          setActiveTab("complaints");
          setMenuOpen(false);
          setSelectedComplaint(null);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded cursor-pointer ${
          activeTab === "complaints" && !selectedComplaint
            ? "text-primary bg-background border-l-2 border-l-primary rounded-r font-bold"
            : "text-muted-text hover:text-primary hover:bg-background/50"
        }`}
      >
        <ClipboardList className="w-4.5 h-4.5" />
        <span>Manage Tickets</span>
      </button>
      <button 
        onClick={() => {
          setActiveTab("notices");
          setMenuOpen(false);
          setSelectedComplaint(null);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded cursor-pointer ${
          activeTab === "notices"
            ? "text-primary bg-background border-l-2 border-l-primary rounded-r font-bold"
            : "text-muted-text hover:text-primary hover:bg-background/50"
        }`}
      >
        <Bell className="w-4.5 h-4.5" />
        <span>Notice Board</span>
      </button>
      <Link 
        href="/dashboard/admin/assets" 
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-text hover:text-primary rounded-r transition-colors"
      >
        <Activity className="w-4.5 h-4.5 text-muted-text" />
        <span>Infrastructure Risk Ledger</span>
      </Link>
    </nav>
  );

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-background text-text font-sans">
      
      {/* Subtle organic grid background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-surface border-r border-border h-screen sticky top-0 z-20 shrink-0 justify-between p-5 shadow-3xs">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1.5 border-b border-border/40 pb-4">
            <div className="p-1.5 bg-primary rounded flex items-center justify-center">
              <Building className="w-4.5 h-4.5 text-white" />
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
        <div className="border-t border-border/40 pt-4 mt-auto space-y-3.5 font-sans">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-text truncate leading-none">{user?.full_name}</div>
                <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Administrator</div>
              </div>
            </div>
            <ThemeToggle />
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
          <Building className="w-4 h-4 text-primary" />
          <span className="font-serif font-bold text-sm tracking-tight text-primary">Nivasa<span className="font-sans font-normal text-secondary italic">AI</span></span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-1.5 text-muted-text hover:text-primary hover:bg-background/50 rounded transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
                  <Building className="w-4 h-4 text-primary" />
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
                  <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Administrator</div>
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 md:px-10 space-y-8">
          
          {/* Top Operational Health Strip */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/60 border border-border bg-surface rounded shadow-3xs overflow-hidden">
            
            <div className="flex-1 p-5 text-center sm:text-left">
              <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest block">Total Cases Logged</span>
              <div className="text-3xl font-bold font-serif text-primary mt-1.5">{analytics?.total_complaints}</div>
              <span className="text-[9.5px] text-muted-text font-medium mt-1 block">Lifetime volume logged</span>
            </div>

            <div className="flex-1 p-5 text-center sm:text-left bg-background/20">
              <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest block font-sans">Unresolved Active Queue</span>
              <div className="text-3xl font-bold font-serif text-primary mt-1.5">{analytics?.active_complaints}</div>
              <span className="text-[9.5px] text-muted-text font-medium mt-1 block">Open & In Progress tickets</span>
            </div>

            <div className="flex-1 p-5 text-center sm:text-left">
              <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest block">SLA Overdue Actions</span>
              <div className={`text-3xl font-bold font-serif mt-1.5 flex items-baseline justify-center sm:justify-start gap-1 ${
                analytics?.overdue_complaints > 0 ? "text-status-danger" : "text-status-success"
              }`}>
                {analytics?.overdue_complaints}
                {analytics?.overdue_complaints > 0 && (
                  <span className="text-[9px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 uppercase tracking-wide">
                    Action Required
                  </span>
                )}
              </div>
              <span className="text-[9.5px] text-muted-text font-medium mt-1 block">Pending resolution &gt; 48 hours</span>
            </div>

            <div className="flex-1 p-5 text-center sm:text-left bg-background/20">
              <span className="text-[9px] font-bold text-muted-text uppercase tracking-widest block">Unresolved High Priority</span>
              <div className={`text-3xl font-bold font-serif mt-1.5 flex items-baseline justify-center sm:justify-start gap-1 ${
                unresolvedHighPriorityCount > 0 ? "text-status-danger" : "text-primary"
              }`}>
                {unresolvedHighPriorityCount}
                {unresolvedHighPriorityCount > 0 && (
                  <span className="text-[9px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 uppercase tracking-wide">
                    Urgent
                  </span>
                )}
              </div>
              <span className="text-[9.5px] text-muted-text font-medium mt-1 block">High urgency active tickets</span>
            </div>

          </div>

          {/* Main Tab Switcher Content */}
          {activeTab === "overview" ? (
            
            /* Overview Dashboard View */
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Table with name and complaints (Simplified view, full-width) */}
              <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans">
                    Recent Service Requests
                  </h3>
                  <button 
                    onClick={() => setActiveTab("complaints")}
                    className="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wide font-sans"
                  >
                    View All Tickets &rarr;
                  </button>
                </div>
                <div className="overflow-x-auto border border-border rounded shadow-3xs bg-surface">
                  <table className="w-full text-xs text-left">
                    <thead className="table-header text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-4 w-16">ID</th>
                        <th className="px-6 py-4">Resident</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4 w-28">Category</th>
                        <th className="px-6 py-4 w-20">Priority</th>
                        <th className="px-6 py-4 w-24 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-text">
                      {complaints.slice(0, 5).map((c) => (
                        <tr key={c.id} className="hover:bg-background/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-muted-text">#COM-{1000 + c.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-text">{c.resident.full_name}</span>
                            <span className="text-[9.5px] text-muted-text block mt-0.5 font-sans">Flat {c.resident.flat_number}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-text truncate max-w-xs">{c.title}</td>
                          <td className="px-6 py-4 text-text">{c.category}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider inline-block ${
                              c.priority === 'High' 
                                ? 'bg-status-danger/5 text-status-danger border-status-danger/15' 
                                : c.priority === 'Medium' 
                                  ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                  : 'bg-status-success/5 text-status-success border-status-success/15'
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-sans">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider inline-block whitespace-nowrap ${
                              c.status === 'Resolved' 
                                ? 'bg-status-success/5 text-status-success border-status-success/15' 
                                : c.status === 'In Progress' 
                                  ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                  : 'bg-status-danger/5 text-status-danger border-status-danger/15'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {complaints.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted-text py-8 bg-background/10 font-medium">
                            No tickets registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side-by-side Graph and Chart below the table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seasonal Load Forecast Graph */}
                <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/40 pb-2.5 font-sans">
                    30-Day Seasonal Load Forecast
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.forecast_30_days} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#5B665E" fontSize={9} tickLine={false} />
                        <YAxis stroke="#5B665E" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#FFFFFF", 
                            borderColor: "#E3E6DF", 
                            borderRadius: "4px", 
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            color: "#1B241E", 
                            fontSize: "10px",
                            fontWeight: "600"
                          }} 
                        />
                        <Line type="monotone" dataKey="count" stroke="#253C2C" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Ticket Distribution Chart */}
                <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/40 pb-2.5 font-sans">
                    Category Ticket Distribution
                  </h3>
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.category_distribution}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          label={(props: any) => `${props.category || ""}`}
                          style={{ fontSize: "9px", fontWeight: "600", fill: "#1B241E" }}
                        >
                          {analytics?.category_distribution?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#FFFFFF", 
                            borderColor: "#E3E6DF", 
                            borderRadius: "4px", 
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            color: "#1B241E", 
                            fontSize: "10px",
                            fontWeight: "600"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>

          ) : activeTab === "notices" ? (
            
            /* Notice Board Manager Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
              
              {/* Notice Creator Form (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/40 pb-2.5 font-sans">
                      Broadcast Announcement
                    </h3>
                    <p className="text-[10.5px] text-muted-text mt-1.5 font-medium leading-relaxed">
                      Publish a digital bulletin. Pinned/urgent announcements display with Spruce borders to draw immediate attention.
                    </p>
                  </div>
                  
                  <form onSubmit={handleCreateNotice} className="space-y-4">
                    <div>
                      <label htmlFor="notice-title" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                        Notice Title
                      </label>
                      <input
                        id="notice-title"
                        type="text"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        required
                        placeholder="e.g. Schedule Water Tank Cleaning"
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text placeholder-muted-text/35 transition-all shadow-3xs font-semibold"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notice-content" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                        Announcement Content
                      </label>
                      <textarea
                        id="notice-content"
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        required
                        rows={5}
                        placeholder="Provide details. (e.g. Water supply will be suspended on Tuesday from 10:00 AM to 2:00 PM for tank maintenance.)"
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text placeholder-muted-text/35 transition-all shadow-3xs leading-relaxed font-semibold font-sans animate-none"
                      />
                    </div>
                    
                    <div className="space-y-3.5 pt-2 border-t border-border/40/60 font-sans">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noticeImportant}
                          onChange={(e) => setNoticeImportant(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-border"
                        />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Mark as Urgent</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noticePinned}
                          onChange={(e) => setNoticePinned(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-border"
                        />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Pin Bulletin to Top</span>
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={noticeLoading}
                      className="w-full px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs active:scale-95 mt-2"
                    >
                      {noticeLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Broadcasting...
                        </>
                      ) : (
                        <>
                          Broadcast Announcement
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Active Notices Table (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans">
                      Active Bulletins Ledger
                    </h3>
                    <span className="text-[10px] font-bold text-muted-text">
                      {notices.length} bulletins published
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto border border-border rounded shadow-3xs bg-surface font-sans">
                    <table className="w-full text-xs text-left">
                      <thead className="table-header text-[10px] font-bold">
                        <tr>
                          <th className="px-6 py-4 w-28">Date Posted</th>
                          <th className="px-6 py-4">Announcement Title</th>
                          <th className="px-6 py-4 w-40">Status Markers</th>
                          <th className="px-6 py-4 w-20 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-text">
                        {notices.map((n) => (
                          <tr key={n.id} className="hover:bg-background/40 transition-colors">
                            <td className="px-6 py-4 text-muted-text font-semibold">
                              {new Date(n.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-text">{n.title}</div>
                              <div className="text-[10px] text-muted-text font-medium truncate max-w-sm mt-0.5">{n.content}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {n.is_important && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-status-danger/5 text-status-danger border border-status-danger/15 font-bold uppercase tracking-wider">
                                    Urgent
                                  </span>
                                )}
                                {n.is_pinned && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                                    Pinned
                                  </span>
                                )}
                                {!n.is_important && !n.is_pinned && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-background text-muted-text border border-border font-bold uppercase tracking-wider">
                                    Standard
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteNotice(n.id)}
                                className="px-2.5 py-1 bg-surface hover:bg-background border border-border hover:border-status-danger hover:text-status-danger rounded text-[9.5px] font-bold text-muted-text transition-all shadow-3xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {notices.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center text-muted-text py-8 bg-background/10 font-medium font-sans">
                              No bulletins currently published.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
            </div>

          ) : (
            
            /* Complaints Management Ledger - FULL WIDTH */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Coherent Filter Toolbar & Table Controls Card */}
              <div className="p-6 bg-surface border border-border rounded shadow-2xs space-y-4">
                
                {/* Header Title & Result Count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-sans">
                    Maintenance Tickets Ledger
                  </h3>
                  <span className="text-[10px] font-bold text-muted-text font-sans">
                    Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} matching tickets
                  </span>
                </div>

                {/* Coherent Filter Toolbar Container */}
                <div className="p-4 bg-background border border-border rounded flex flex-col gap-3 shadow-3xs font-sans">
                  
                  {/* Row 1: Search, Category, Status, Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center w-3.5 h-3.5 text-muted-text/60 mt-2.5" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Search ID, Flat, keyword..."
                        className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded text-xs placeholder-muted-text/50 focus:outline-none focus:border-primary text-text transition-all"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                      className="px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary cursor-pointer font-bold shadow-3xs"
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
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary cursor-pointer font-bold shadow-3xs"
                    >
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                      className="px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary cursor-pointer font-bold shadow-3xs"
                    >
                      <option value="">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Row 2: Date Filters, Overdue Toggle, Clear Actions */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-border/60/60 flex-wrap">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-primary uppercase">From:</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                          className="px-2.5 py-1 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-primary uppercase">To:</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                          className="px-2.5 py-1 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between lg:justify-end">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overdueOnly}
                          onChange={(e) => { setOverdueOnly(e.target.checked); setCurrentPage(1); }}
                          className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-border"
                        />
                        <span className="text-[10.5px] font-bold text-primary uppercase">Overdue SLA Only</span>
                      </label>

                      <button
                        onClick={handleClearFilters}
                        className="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wide cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>

                </div>

                {/* Scannable Ledger Table (Desktop View) */}
                <div className="overflow-x-auto border border-border rounded shadow-3xs bg-surface">
                  <table className="w-full text-xs text-left">
                    <thead className="table-header text-[10px] font-bold">
                      <tr>
                        <th 
                          onClick={() => handleSort("id")}
                          className="px-6 py-4 w-16 cursor-pointer hover:bg-background select-none"
                        >
                          <div className="flex items-center gap-1">
                            ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4 w-24">Location</th>
                        <th className="px-6 py-4 w-28">Resident</th>
                        <th 
                          onClick={() => handleSort("created_at")}
                          className="px-6 py-4 w-24 cursor-pointer hover:bg-background select-none"
                        >
                          <div className="flex items-center gap-1">
                            Logged Date {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("priority")}
                          className="px-6 py-4 w-20 cursor-pointer hover:bg-background select-none"
                        >
                          <div className="flex items-center gap-1">
                            Priority {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("status")}
                          className="px-6 py-4 w-24 text-right cursor-pointer hover:bg-background select-none"
                        >
                          <div className="flex items-center justify-end gap-1">
                            Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-text">
                      {paginatedComplaints.map((c) => {
                        const overdue = isOverdue(c.created_at, c.status);
                        
                        return (
                          <tr key={c.id} className="hover:bg-background/40 transition-colors group">
                            <td className="px-6 py-4.5 font-bold text-muted-text">#COM-{1000 + c.id}</td>
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-text text-xs">{c.title}</span>
                                {overdue && (
                                  <span className="text-[8px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/25 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0">
                                    <AlertTriangle className="w-2.5 h-2.5" /> SLA Overdue
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 text-text font-semibold">{c.location}</td>
                            <td className="px-6 py-4.5">
                              <div className="text-text font-bold leading-none">{c.resident.full_name}</div>
                              <div className="text-[9.5px] text-muted-text mt-1 font-bold leading-none font-sans">Flat {c.resident.flat_number}</div>
                            </td>
                            <td className="px-6 py-4.5 text-muted-text font-semibold">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4.5">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider inline-block ${
                                c.priority === 'High' 
                                  ? 'bg-status-danger/5 text-status-danger border-status-danger/15' 
                                  : c.priority === 'Medium' 
                                    ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                    : 'bg-status-success/5 text-status-success border-status-success/15'
                              }`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex items-center justify-end gap-2 text-right">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider inline-block whitespace-nowrap ${
                                  c.status === 'Resolved' 
                                    ? 'bg-status-success/5 text-status-success border-status-success/15' 
                                    : c.status === 'In Progress' 
                                      ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                      : 'bg-status-danger/5 text-status-danger border-status-danger/15'
                                }`}>
                                  {c.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedComplaint(c);
                                    setUpdateStatus(c.status);
                                    setUpdatePriority(c.priority);
                                    setImgError(false);
                                  }}
                                  className="px-2.5 py-1 bg-surface hover:bg-background border border-border rounded text-[9.5px] font-bold text-primary opacity-90 group-hover:opacity-100 transition-all shadow-3xs cursor-pointer font-sans"
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedComplaints.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted-text py-8 bg-background/10 font-medium font-sans">
                            No active tickets match the search queries.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards List */}
                <div className="md:hidden space-y-4">
                  {paginatedComplaints.map((c) => {
                    const overdue = isOverdue(c.created_at, c.status);
                    
                    return (
                      <div 
                        key={c.id} 
                        className="bg-surface border border-border rounded p-4 shadow-3xs space-y-3"
                      >
                        {/* Header: Category & Status */}
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="text-xs font-bold text-primary">{c.category}</span>
                          <div className="flex items-center gap-1.5">
                            {overdue && (
                              <span className="text-[8px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/20 px-1.5 py-0.5 rounded-full">SLA Overdue</span>
                            )}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                              c.status === 'Resolved' 
                                ? 'bg-status-success/5 text-status-success border-status-success/15' 
                                : c.status === 'In Progress' 
                                  ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                  : 'bg-status-danger/5 text-status-danger border-status-danger/15'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                        </div>

                        {/* Subject details */}
                        <div>
                          <h4 className="text-xs font-bold text-text">{c.title}</h4>
                          <p className="text-[10px] text-muted-text mt-1 font-medium leading-relaxed">{c.description}</p>
                          <div className="text-[10px] text-muted-text mt-2 font-semibold font-sans">
                            Loc: <span className="text-text font-bold">{c.location}</span> • Resident: <span className="text-text font-bold">{c.resident.full_name} (Flat {c.resident.flat_number})</span>
                          </div>
                        </div>

                        {/* Footer details & Action */}
                        <div className="flex items-center justify-between text-[9px] text-muted-text font-semibold border-t border-border/40 pt-2 font-sans">
                          <div>Logged: <span className="text-text">{new Date(c.created_at).toLocaleDateString()}</span></div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text uppercase">{c.priority}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setUpdateStatus(c.status);
                                setUpdatePriority(c.priority);
                                setImgError(false);
                              }}
                              className="px-2 py-0.5 bg-surface hover:bg-background border border-border rounded text-[9px] font-bold text-primary cursor-pointer shadow-3xs"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {paginatedComplaints.length === 0 && (
                    <div className="text-center text-xs text-muted-text py-6 font-medium bg-background rounded border border-dashed border-border/60 font-sans">
                      No active tickets match the search queries.
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs font-sans">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-background text-primary font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-3xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    
                    <div className="hidden sm:flex items-center gap-1 font-semibold text-muted-text">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-7 h-7 rounded border text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                            pg === currentPage
                              ? "bg-primary text-white border-primary"
                              : "bg-surface border-border hover:bg-background text-muted-text"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <div className="sm:hidden text-muted-text font-bold text-[11px]">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-background text-primary font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-3xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Ops Assistant Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-3.5 bg-primary hover:bg-primary/95 text-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
          title="Open Query Assistant"
        >
          <MessageSquare className="w-5.5 h-5.5" />
          {chatHistory.length > 1 && !chatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-danger border border-white text-[8px] font-bold flex items-center justify-center">{chatHistory.length - 1}</span>
          )}
        </button>

        {/* AI Assistant Chat Panel */}
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-surface border border-border rounded shadow-md overflow-hidden flex flex-col h-[450px] animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-3 bg-background border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs font-bold text-primary font-serif">Nivasa Ops Query Assistant</div>
                  <div className="text-[8px] text-muted-text flex items-center gap-0.5 font-bold uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5 text-secondary animate-pulse" /> AI Data Link Active
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-muted-text hover:text-text text-[10px] font-bold cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded transition-colors">Close</button>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-background/20">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded max-w-[85%] text-xs space-y-2 leading-relaxed border shadow-3xs ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white border-primary rounded-tr-none' 
                      : 'bg-surface border-border text-text rounded-tl-none font-sans font-medium opacity-95'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Suggested Action Tags */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1 border-t border-border/40 pt-2.5 mt-1.5">
                        {msg.actions.map((act: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setChatMessage(act)}
                            className="px-2 py-0.5 bg-background hover:bg-slate-200 text-primary border border-border rounded text-[9px] font-bold transition-all cursor-pointer shadow-3xs"
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
                  <div className="p-3 bg-surface border border-border rounded flex items-center gap-1.5 text-xs text-muted-text font-medium shadow-3xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> Analyzing logs...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-2.5 bg-surface border-t border-border/40 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Query complaints, recurring issues..."
                className="flex-1 px-3 py-2 bg-background/50 border border-border rounded text-xs placeholder-muted-text/50 focus:outline-none focus:border-primary text-text transition-all"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="px-3 bg-primary hover:bg-primary/95 rounded text-white transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-white/95" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Redesigned Service Ticket Work Order Console Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-3xs px-4">
          <div className="bg-surface border border-border rounded shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-150 flex flex-col justify-between gap-6">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest bg-background px-2.5 py-1 rounded border border-border">
                  Work Order Ticket #COM-{1000 + selectedComplaint.id}
                </span>
                <h2 className="text-base font-serif font-bold text-primary mt-1.5">{selectedComplaint.title}</h2>
              </div>
              <button 
                onClick={() => { setSelectedComplaint(null); setImgError(false); }} 
                className="text-muted-text hover:text-primary text-xs p-1 self-end sm:self-center cursor-pointer"
                aria-label="Close Work Order Console"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overdue Warning Banner */}
            {isOverdue(selectedComplaint.created_at, selectedComplaint.status) && (
              <div className="p-3 bg-status-danger/5 border border-status-danger/25 text-status-danger text-xs font-bold rounded flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <span>SLA OVERDUE: This work order has been pending action for {getElapsedHours(selectedComplaint.created_at)} hours. Coordinate immediate engineer dispatch.</span>
              </div>
            )}

            {/* Grid Layout (Left: Summary & Photo; Right: Timeline History) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Complaint Details & Photo */}
              <div className="space-y-4">
                
                {/* Complaint Summary details */}
                <div className="p-4 bg-background/50 border border-border rounded shadow-3xs space-y-3.5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">Issue Details</span>
                    <p className="text-text font-medium leading-relaxed font-sans opacity-95">{selectedComplaint.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-3 text-text font-semibold">
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Specific Location</span>
                      <span className="mt-0.5 block">{selectedComplaint.location}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Category Section</span>
                      <span className="mt-0.5 block">{selectedComplaint.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-3 text-text font-semibold">
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Date Filed</span>
                      <span className="mt-0.5 block">{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Open Duration</span>
                      <span className="mt-0.5 block">{getElapsedHours(selectedComplaint.created_at)} hours</span>
                    </div>
                  </div>
                </div>

                {/* Resident Profile details */}
                <div className="p-4 border border-border bg-background/20 rounded shadow-3xs text-xs space-y-2">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block border-b border-border/40 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Reporting Resident Information
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-text font-semibold">
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Full Name</span>
                      <span className="mt-0.5 block">{selectedComplaint.resident.full_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-text uppercase block">Flat / Unit</span>
                      <span className="mt-0.5 block">Flat {selectedComplaint.resident.flat_number}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Attachment Photo Reference */}
                <div className="p-4 border border-border rounded shadow-3xs text-xs space-y-2">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block border-b border-border/40 pb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Photo Reference Attachment
                  </span>
                  {selectedComplaint.photo_url && !imgError ? (
                    <div className="relative rounded overflow-hidden border border-border shadow-3xs">
                      <img 
                        src={selectedComplaint.photo_url.startsWith('http') || selectedComplaint.photo_url.startsWith('data:') ? selectedComplaint.photo_url : `${API_BASE_URL}/static/${selectedComplaint.photo_url}`} 
                        onError={() => setImgError(true)} 
                        className="w-full h-44 object-cover"
                        alt="Work order reference attachment"
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-background border border-dashed border-border rounded flex flex-col items-center justify-center text-center text-xs text-muted-text gap-1.5 shadow-3xs">
                      <ImageIcon className="w-7 h-7 text-muted-text/30" />
                      <div>
                        <span className="font-bold text-primary block">{selectedComplaint.photo_url ? "Attachment Unavailable" : "No Attachment Reference"}</span>
                        <span className="block mt-0.5 font-medium opacity-80 text-[10px]">
                          {selectedComplaint.photo_url 
                            ? "This photo is missing or was submitted before the file upload update." 
                            : "No verification photo was uploaded with this complaint."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              {/* Right Column: History Timeline */}
              <div className="space-y-4">
                <div className="p-4 border border-border bg-surface rounded shadow-3xs text-xs space-y-3.5 max-h-[380px] overflow-y-auto">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block border-b border-border/40 pb-2">
                    Service History Logs Timeline
                  </span>
                  
                  <div className="space-y-4 relative pl-1.5 mt-2">
                    {selectedComplaint.history.map((h: any) => (
                      <div key={h.id} className="relative pl-5 border-l border-border text-xs pb-3.5 last:border-l-transparent last:pb-0">
                        <div className="absolute top-1.5 -left-1.5 w-3 h-3 rounded-full bg-surface border border-primary flex items-center justify-center shadow-3xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] text-muted-text font-bold mb-1.5">
                          <span className="bg-background px-1.5 py-0.5 border border-border rounded uppercase tracking-wider inline-block">
                            {h.status_from} &rarr; {h.status_to}
                          </span>
                          <span>
                            {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <p className="text-text font-sans font-medium leading-relaxed opacity-95 bg-background/50 p-2.5 rounded border border-border/40">
                          {h.comment}
                        </p>
                        <div className="text-[8.5px] text-muted-text mt-1.5 font-bold">
                          Logged by: <span className="text-primary">{h.changed_by.full_name} ({h.changed_by.role})</span>
                        </div>
                      </div>
                    ))}
                    
                    {selectedComplaint.history.length === 0 && (
                      <div className="text-center text-xs text-muted-text py-4">
                        No service logs registered.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Separated Operations Update Controls Form */}
            <div className="bg-background border border-border p-4.5 rounded shadow-3xs space-y-4">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest border-b border-border/10 pb-1">
                <ShieldAlert className="w-4 h-4 text-primary" /> Update Work Order Status (Operational Action)
              </div>
              
              <form onSubmit={handleUpdateComplaint} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-status" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1">Update Status</label>
                    <select
                      id="modal-status"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary cursor-pointer font-bold shadow-3xs"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="modal-priority" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1">Override Priority</label>
                    <select
                      id="modal-priority"
                      value={updatePriority}
                      onChange={(e) => setUpdatePriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:border-primary cursor-pointer font-bold shadow-3xs"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-comment" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1">Action Log Comment Note</label>
                  <textarea
                    id="modal-comment"
                    value={updateComment}
                    onChange={(e) => setUpdateComment(e.target.value)}
                    required
                    rows={2}
                    placeholder="Provide audit notes explaining the change. (e.g. Dispatched elevator technician to Floor 4. Verified lift sensor calibration.)"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary placeholder-muted-text/45 transition-all shadow-3xs"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60/60 pt-3">
                  <button
                    type="button"
                    onClick={() => { setSelectedComplaint(null); setImgError(false); }}
                    className="px-4 py-2 bg-surface hover:bg-background border border-border text-primary rounded text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-3xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {updateLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Transition...
                      </>
                    ) : (
                      <>
                        Save Transition Log
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
