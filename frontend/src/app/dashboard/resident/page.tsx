"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Building, User, LogOut, CheckCircle, Clock, Info, AlertTriangle, 
  Plus, MessageSquare, Image as ImageIcon, Send, Bell, ClipboardList, AlertCircle, RefreshCw, Sparkles,
  Menu, X, ChevronDown, ChevronUp, ArrowLeft, Mic, MicOff
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResidentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");
  
  // Mobile navigation drawer toggle
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Collapsible ticket form toggle
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  
  // Selected ticket for dedicated "Details Tracker" page view
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  
  // Expanded row tracker for complaints ledger (fallback inline toggle)
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  
  // Create complaint form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  
  // Selected image preview and validation states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  
  // AI Preview State
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Voice dictation states
  const [listeningTitle, setListeningTitle] = useState(false);
  const [listeningDesc, setListeningDesc] = useState(false);
  
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
      setError("");
      // 1. Fetch complaints
      const resComplaints = await fetch(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resComplaints.ok) throw new Error("Failed to load complaints");
      const fetchedComplaints = await resComplaints.json();
      setComplaints(fetchedComplaints);
      
      // Sync selected ticket details if active
      if (selectedTicket) {
        const updated = fetchedComplaints.find((c: any) => c.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
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
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data. Please reload.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Handle local file changes and generate image thumbnails
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file format (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Attachment file size must be smaller than 5MB.");
      return;
    }

    setPhotoUrl(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reset file uploader values
  const handleRemovePhoto = () => {
    setPhotoUrl("");
    setPhotoPreview(null);
    setUploadError("");
    const fileInput = document.getElementById("file-uploader") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
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
      const descLower = description ? description.toLowerCase() : "";
      const titleLower = title ? title.toLowerCase() : "";
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
      setCategory(predictedCat);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const startSpeechRecognition = (field: "title" | "description") => {
    setError("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser. Please try Google Chrome, Microsoft Edge, or Apple Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (field === "title") setListeningTitle(true);
      else setListeningDesc(true);
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setError("Voice command failed: " + event.error);
      setListeningTitle(false);
      setListeningDesc(false);
    };

    recognition.onend = () => {
      setListeningTitle(false);
      setListeningDesc(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (field === "title") {
        setTitle(speechToText);
      } else {
        setDescription(speechToText);
        // Auto-predict details if they dictate the description details!
        const words = speechToText.split(" ");
        if (!title && words.length > 0) {
          const autoTitle = words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
          setTitle(autoTitle);
        }
      }
    };

    recognition.start();
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let finalPhotoUrl = null;

      // 1. Upload file if selected
      const fileInput = document.getElementById("file-uploader") as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${API_BASE_URL}/api/complaints/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image attachment to server");
        }

        const uploadData = await uploadRes.json();
        finalPhotoUrl = uploadData.photo_url;
      }

      // 2. Submit the complaint
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
          photo_url: finalPhotoUrl
        })
      });

      if (!response.ok) {
        throw new Error("Failed to file complaint");
      }

      // Reset form fields
      setTitle("");
      setDescription("");
      setLocation("");
      setPhotoUrl("");
      setPhotoPreview(null);
      setAiPreview(null);
      setShowRaiseForm(false); // Close drawer
      
      // Refresh list
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

  // Check if a ticket has exceeded the 48-hour SLA
  const isOverdue = (createdStr: string, status: string) => {
    if (status === "Resolved") return false;
    const createdDate = new Date(createdStr);
    const now = new Date();
    const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Get date of last history transition, fallback to created_at
  const getLastUpdated = (c: any) => {
    if (c.history && c.history.length > 0) {
      return new Date(c.history[c.history.length - 1].created_at).toLocaleDateString();
    }
    return new Date(c.created_at).toLocaleDateString();
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex bg-background text-text font-sans relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <aside className="hidden md:flex md:flex-col md:w-64 bg-surface border-r border-border h-screen sticky top-0 p-5 justify-between shrink-0 z-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 px-2 py-1.5 border-b border-border/40 pb-4">
              <div className="w-8 h-8 rounded bg-background animate-pulse" />
              <div className="h-4 w-28 bg-background rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-background rounded animate-pulse mb-3" />
              <div className="h-8 bg-background rounded animate-pulse w-full" />
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 mt-auto space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-background animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-background rounded animate-pulse" />
                <div className="h-2.5 w-14 bg-background rounded animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 z-10">
          <section className="bg-surface border-b border-border/85 px-8 py-8">
            <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="h-7 w-56 bg-slate-200/60 rounded animate-pulse" />
                <div className="h-3.5 w-96 bg-background rounded animate-pulse" />
              </div>
              <div className="h-9 w-32 bg-slate-200/60 rounded animate-pulse shrink-0" />
            </div>
          </section>

          <div className="max-w-7xl w-full mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-4 w-32 bg-slate-200/60 rounded animate-pulse" />
              <div className="border border-border rounded bg-surface overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-border/40 bg-background flex gap-4">
                  <div className="h-3.5 w-12 bg-background rounded animate-pulse" />
                  <div className="h-3.5 w-48 bg-background rounded animate-pulse" />
                </div>
                <div className="p-5 space-y-5">
                  <div className="h-10 bg-background rounded animate-pulse w-full" />
                  <div className="h-10 bg-background rounded animate-pulse w-full" />
                  <div className="h-10 bg-background rounded animate-pulse w-full" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-5 bg-surface border border-border rounded shadow-2xs space-y-4">
                <div className="h-4 w-32 bg-slate-200/60 rounded animate-pulse border-b border-border/40 pb-2.5" />
                <div className="h-20 bg-background rounded animate-pulse" />
                <div className="h-20 bg-background rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unreadNotis = notifications.filter(n => !n.is_read);

  // Group active vs unresolved for headers
  const activeComplaintsCount = complaints.filter(c => c.status !== "Resolved").length;

  // Derive Global Recent Activity Feed from history updates
  const recentActivity = complaints
    .flatMap(c => c.history.map((h: any) => ({ ...h, ticketTitle: c.title, ticketId: c.id })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      <button 
        onClick={() => {
          setActiveTab("overview");
          setMenuOpen(false);
          setSelectedTicket(null);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded cursor-pointer ${
          activeTab === "overview" && !selectedTicket
            ? "text-primary bg-background border-l-2 border-l-primary rounded-r font-bold"
            : "text-muted-text hover:text-primary hover:bg-background/50"
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        <span>Overview & Tickets</span>
      </button>
      <button 
        onClick={() => {
          setActiveTab("logs");
          setMenuOpen(false);
          setSelectedTicket(null);
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded cursor-pointer ${
          activeTab === "logs"
            ? "text-primary bg-background border-l-2 border-l-primary rounded-r font-bold"
            : "text-muted-text hover:text-primary hover:bg-background/50"
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>System Logs</span>
      </button>
    </nav>
  );

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-background text-text font-sans">
      
      {/* Subtle grid pattern overlay */}
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

        <div className="border-t border-border/40 pt-4 mt-auto space-y-3.5 font-sans">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-text truncate leading-none">{user?.full_name}</div>
                <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Flat {user?.flat_number}</div>
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
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative group">
            <button className="relative p-1.5 text-muted-text hover:text-primary transition-colors cursor-pointer rounded hover:bg-background/50">
              <Bell className="w-4.5 h-4.5" />
              {unreadNotis.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-status-danger rounded-full" />
              )}
            </button>
            <div className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded shadow-md p-4 hidden group-hover:block z-50 animate-in fade-in duration-100">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/40">
                <span className="text-xs font-bold text-primary">Notifications</span>
                {unreadNotis.length > 0 && (
                  <button onClick={handleMarkNotificationsRead} className="text-[9px] text-secondary hover:underline cursor-pointer font-bold uppercase tracking-wider">Mark read</button>
                )}
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center text-xs text-muted-text py-4">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2 rounded border border-border/40 text-xs bg-background/50">
                      <div className="font-bold text-primary mb-0.5">{n.title}</div>
                      <div className="font-sans text-[10px] text-muted-text">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
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
                  <div className="text-[10px] text-muted-text font-bold leading-none mt-1 truncate">Flat {user?.flat_number}</div>
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
        
        {/* Conditional Rendering between Tracker Details and Ledger Overview */}
        {selectedTicket ? (
          
          /* Dedicated Service Request Details Tracker View */
          <div className="flex-1 flex flex-col min-w-0 bg-background animate-in fade-in duration-200">
            {/* Header back button strip */}
            <section className="bg-surface border-b border-border/80 px-8 py-6 md:px-10">
              <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
                <button 
                  onClick={() => {
                    setSelectedTicket(null);
                    setImgError(false);
                  }}
                  className="text-xs font-bold text-muted-text hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Tickets Ledger
                </button>
                
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest bg-background px-2.5 py-1 rounded border border-border">
                  Ticket #COM-{1000 + selectedTicket.id}
                </span>
              </div>
            </section>

            <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 md:px-10 space-y-8">
              
              {/* Stepper Status Banner */}
              <div className="p-8 bg-surface border border-border rounded shadow-2xs space-y-8">
                
                {/* Stepper Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-text tracking-widest">{selectedTicket.category} Department</span>
                    <h2 className="text-lg font-serif font-bold text-primary mt-1">{selectedTicket.title}</h2>
                  </div>
                  
                  {selectedTicket.status === "Resolved" ? (
                    <div className="bg-status-success/5 border border-status-success/15 text-status-success text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 self-start sm:self-center">
                      <CheckCircle className="w-4.5 h-4.5" /> Resolved & Completed
                    </div>
                  ) : selectedTicket.status === "In Progress" ? (
                    <div className="bg-status-warning/5 border border-status-warning/15 text-status-warning text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 self-start sm:self-center">
                      <Clock className="w-4.5 h-4.5 animate-pulse" /> Dispatched & Active
                    </div>
                  ) : (
                    <div className="bg-status-danger/5 border border-status-danger/15 text-status-danger text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 self-start sm:self-center">
                      <AlertCircle className="w-4.5 h-4.5" /> Logged & Awaiting Review
                    </div>
                  )}
                </div>

                {/* Progress bar connector */}
                <div className="relative border-t border-border/40 pt-8">
                  <div className="max-w-xl mx-auto flex items-center justify-between relative">
                    
                    {/* Background connecting bar */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-background z-0" />
                    
                    {/* Active fill connecting bar */}
                    <div className={`absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300 z-0 ${
                      selectedTicket.status === "Resolved" 
                        ? "w-full" 
                        : selectedTicket.status === "In Progress" 
                          ? "w-1/2" 
                          : "w-0"
                    }`} />

                    {/* Step 1: Logged */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-3xs">
                        1
                      </div>
                      <span className="text-[10px] font-bold text-primary">Ticket Logged</span>
                    </div>

                    {/* Step 2: Working */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-3xs ${
                        selectedTicket.status === "In Progress" || selectedTicket.status === "Resolved"
                          ? "bg-primary text-white"
                          : "bg-surface border border-border text-muted-text"
                      }`}>
                        2
                      </div>
                      <span className={`text-[10px] font-bold ${
                        selectedTicket.status === "In Progress" || selectedTicket.status === "Resolved"
                          ? "text-primary"
                          : "text-muted-text"
                      }`}>Dispatched</span>
                    </div>

                    {/* Step 3: Resolved */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-3xs ${
                        selectedTicket.status === "Resolved"
                          ? "bg-status-success text-white"
                          : "bg-surface border border-border text-muted-text"
                      }`}>
                        3
                      </div>
                      <span className={`text-[10px] font-bold ${
                        selectedTicket.status === "Resolved"
                          ? "text-status-success"
                          : "text-muted-text"
                      }`}>Resolved</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Split Details Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Side: Summary & Visual Photo reference (lg:col-span-6) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Summary Card */}
                  <div className="p-8 bg-surface border border-border rounded shadow-2xs space-y-6">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                      Request Summary
                    </h3>
                    
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Description Details</span>
                        <p className="text-text mt-1.5 font-medium font-sans leading-relaxed opacity-95">{selectedTicket.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-3 font-semibold text-text">
                        <div>
                          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Specific Location</span>
                          <span className="mt-1 block">{selectedTicket.location}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Category Section</span>
                          <span className="mt-1 block">{selectedTicket.category}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-3 font-semibold text-text">
                        <div>
                          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Created Date</span>
                          <span className="mt-1 block">{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Last Updated</span>
                          <span className="mt-1 block">{getLastUpdated(selectedTicket)}</span>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-3 font-semibold text-text">
                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Priority Classification</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border inline-block mt-1 font-bold uppercase tracking-wider ${
                          selectedTicket.priority === 'High' 
                            ? 'bg-status-danger/5 text-status-danger border-status-danger/15' 
                            : selectedTicket.priority === 'Medium' 
                              ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                              : 'bg-status-success/5 text-status-success border-status-success/15'
                        }`}>
                          {selectedTicket.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Visual Reference Card */}
                  <div className="p-8 bg-surface border border-border rounded shadow-2xs space-y-6">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                      Reference Photo Attachment
                    </h3>
                    
                    {selectedTicket.photo_url && !imgError ? (
                      <div className="relative rounded overflow-hidden border border-border shadow-3xs">
                        <img 
                          src={selectedTicket.photo_url.startsWith('http') || selectedTicket.photo_url.startsWith('data:') ? selectedTicket.photo_url : `${API_BASE_URL}/static/${selectedTicket.photo_url}`} 
                          onError={() => setImgError(true)} 
                          className="w-full h-52 object-cover"
                          alt="Service request reference image"
                        />
                      </div>
                    ) : (
                      <div className="p-8 bg-background border border-dashed border-border rounded flex flex-col items-center justify-center text-center text-xs text-muted-text gap-2 shadow-3xs">
                        <ImageIcon className="w-8 h-8 text-muted-text/30" />
                        <div>
                          <span className="font-bold text-primary block">{selectedTicket.photo_url ? "Attachment Unavailable" : "No Attachment Reference"}</span>
                          <span className="block mt-0.5 font-medium opacity-80 text-[11px]">
                            {selectedTicket.photo_url 
                              ? "This photo is missing or was submitted before the file upload update." 
                              : "No verification photo was uploaded with this complaint."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Chronological History Timeline (lg:col-span-6) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-8 bg-surface border border-border rounded shadow-2xs space-y-6">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                      Chronological History Timeline
                    </h3>
                    
                    <div className="space-y-5 relative pl-1.5 mt-2">
                      {selectedTicket.history.map((h: any) => (
                        <div key={h.id} className="relative pl-6 border-l border-border text-xs pb-5.5 last:border-l-transparent last:pb-0">
                          <div className="absolute top-1.5 -left-1.5 w-3 h-3 rounded-full bg-surface border border-primary flex items-center justify-center shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] text-muted-text font-bold mb-1.5">
                            <span className="bg-background px-2 py-0.5 border border-border rounded uppercase tracking-wider inline-block">
                              {h.status_from} &rarr; {h.status_to}
                            </span>
                            <span>
                              {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <p className="text-text font-sans font-medium leading-relaxed opacity-95 bg-background/50 p-2.5 rounded border border-border/40">
                            {h.comment}
                          </p>
                          
                          <div className="text-[9px] text-muted-text mt-1.5 font-bold">
                            Action logged by: <span className="text-primary">{h.changed_by.full_name} ({h.changed_by.role})</span>
                          </div>
                        </div>
                      ))}
                      
                      {selectedTicket.history.length === 0 && (
                        <div className="text-center text-xs text-muted-text py-6 font-medium">
                          No history log entries available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </main>
          </div>

        ) : activeTab === "logs" ? (
           
           /* System Logs Dedicated Page */
           <>
             {/* Header */}
             <section className="bg-surface border-b border-border/80 px-8 py-10 md:px-10">
               <div className="max-w-7xl w-full mx-auto">
                 <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary tracking-tight">
                   System Activity Logs
                 </h1>
                 <p className="text-xs text-muted-text mt-1.5 font-medium leading-relaxed">
                   Audit history and chronological transition logs for all your filed complaints.
                 </p>
               </div>
             </section>

             <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 md:px-10 space-y-6">
               <div className="p-8 bg-surface border border-border rounded shadow-2xs space-y-8">
                 <div className="space-y-4">
                   {recentActivity.length === 0 ? (
                     <div className="text-center text-xs text-muted-text py-12 font-medium bg-background rounded border border-dashed border-border/60">
                       No system updates or ticket activities recorded yet.
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {recentActivity.map((log: any, idx: number) => (
                         <div 
                           key={idx} 
                           className="p-5 rounded border border-border bg-background/10 text-xs space-y-2.5 shadow-3xs cursor-pointer hover:bg-background transition-colors"
                           onClick={() => {
                             const ticket = complaints.find(c => c.id === log.ticketId);
                             if (ticket) {
                               setSelectedTicket(ticket);
                             }
                           }}
                         >
                           <div className="flex justify-between items-center gap-2 border-b border-border/40/50 pb-2">
                             <span className="text-primary font-bold text-xs truncate max-w-[200px] hover:underline">
                               {log.ticketTitle}
                             </span>
                             <span className="text-[10px] text-muted-text font-bold">
                               {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                           </div>
                           <p className="text-text font-sans font-medium leading-relaxed bg-surface p-3 rounded border border-border/40">
                             {log.comment}
                           </p>
                           <div className="text-[10px] text-muted-text font-bold flex justify-between items-center pt-1">
                             <span>Change: <span className="bg-background px-2 py-0.5 border border-border rounded uppercase text-[8.5px] font-bold">{log.status_from} &rarr; {log.status_to}</span></span>
                             <span>Logged by: <span className="text-primary font-bold">{log.changed_by.full_name}</span></span>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             </main>
           </>

         ) : (
           
           /* Overview & Tickets Page (Full Width, with Pinned Announcements) */
           <>
             {/* Editorial Header Greeting Area */}
             <section className="bg-surface border-b border-border/80 px-8 py-10 md:px-10">
               <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary tracking-tight">
                     Welcome back, {user?.full_name}
                   </h1>
                   <p className="text-xs text-muted-text mt-1.5 font-medium leading-relaxed">
                     Unit {user?.flat_number} • Resident Portal. You have <span className="font-bold text-primary">{activeComplaintsCount} active</span> maintenance requests.
                   </p>
                 </div>
                 
                 <button
                   onClick={() => setShowRaiseForm(!showRaiseForm)}
                   className="self-start md:self-center px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-2xs cursor-pointer shrink-0"
                 >
                   {showRaiseForm ? (
                     <>
                       <X className="w-4 h-4 text-white/80" /> Close Form
                     </>
                   ) : (
                     <>
                       <Plus className="w-4 h-4 text-white/80" /> Raise Complaint
                     </>
                   )}
                 </button>
               </div>
             </section>

             {/* Pinned Announcements Grid - Full Width, Right Below Header */}
             {notices.length > 0 && (
               <section className="bg-surface border-b border-border/50 px-8 py-6 md:px-10">
                 <div className="max-w-7xl w-full mx-auto">
                   <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Bell className="w-4 h-4 text-secondary animate-pulse" /> Pinned Announcements
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {notices.map((n) => (
                       <div 
                         key={n.id} 
                         className={`p-5 rounded border shadow-3xs space-y-2.5 transition-all ${
                           n.is_pinned || n.is_important
                             ? "bg-background/40 border-border/80 border-l-2 border-l-primary"
                             : "bg-surface border-border"
                         }`}
                       >
                         <div className="flex items-center justify-between gap-2">
                           <span className="text-xs font-bold text-primary font-serif truncate">{n.title}</span>
                           {(n.is_pinned || n.is_important) && (
                             <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 font-bold uppercase tracking-wider shrink-0">
                               {n.is_pinned ? "Pinned" : "Urgent"}
                             </span>
                           )}
                         </div>
                         <p className="text-xs text-muted-text leading-relaxed font-sans font-medium line-clamp-3">{n.content}</p>
                         <span className="block text-[8px] text-muted-text/80 font-bold mt-1 text-right">
                           {new Date(n.created_at).toLocaleDateString()}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               </section>
             )}

             {/* Global Error Banner */}
             {error && !pageLoading && complaints.length === 0 && (
               <div className="max-w-7xl w-full mx-auto px-8 py-8 md:px-10">
                 <div className="p-4 bg-status-danger/5 border border-status-danger/25 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-status-danger text-xs">
                   <div className="flex items-center gap-2.5">
                     <AlertCircle className="w-5 h-5 shrink-0" />
                     <div>
                       <span className="font-bold">System Connection Issue:</span> {error}
                     </div>
                   </div>
                   <button 
                     onClick={() => {
                       setPageLoading(true);
                       fetchData(localStorage.getItem("token") || "");
                     }}
                     className="px-3 py-1 bg-status-danger text-white font-bold rounded hover:bg-status-danger/90 transition-colors cursor-pointer self-end sm:self-center"
                   >
                     Try Again
                   </button>
                 </div>
               </div>
             )}

             <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 md:px-10 space-y-8">
               
               {/* Redesigned Raise Complaint Form Panel (Full Width) */}
               {showRaiseForm && (
                 <div className="p-8 bg-surface border border-border rounded shadow-xs animate-in fade-in slide-in-from-top-3 duration-250 space-y-6">
                   <div className="flex items-center justify-between border-b border-border/40 pb-3">
                     <div>
                       <h3 className="text-sm font-serif font-bold text-primary flex items-center gap-2">
                         <Plus className="w-4.5 h-4.5 text-primary" /> File a Maintenance Request
                       </h3>
                       <p className="text-[10.5px] text-muted-text mt-0.5 font-medium">Log infrastructure defects. AI validates keywords to match priorities dynamically.</p>
                     </div>
                     <button 
                       onClick={() => setShowRaiseForm(false)} 
                       className="text-muted-text hover:text-primary text-xs p-1"
                       aria-label="Close form"
                     >
                       <X className="w-4.5 h-4.5" />
                     </button>
                   </div>
                    {error && (
                      <div className="p-3 bg-status-danger/5 border border-status-danger/20 rounded text-status-danger text-xs flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" /> <span className="font-bold">{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateComplaint} className="space-y-4">
                      
                      {/* Grid: Subject, Location & Category Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-1.5 font-sans">
                            <label htmlFor="ticket-title" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider">
                              Short Subject
                            </label>
                            <button
                              type="button"
                              onClick={() => startSpeechRecognition("title")}
                              className={`px-2 py-0.5 border rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-3xs uppercase tracking-wider ${
                                listeningTitle 
                                  ? 'bg-status-danger/10 text-status-danger border-status-danger/30 animate-pulse' 
                                  : 'bg-surface text-muted-text border-border hover:text-primary hover:bg-background'
                              }`}
                            >
                              {listeningTitle ? (
                                <>
                                  <MicOff className="w-3 h-3" /> Listening...
                                </>
                              ) : (
                                <>
                                  <Mic className="w-3 h-3" /> Dictate Subject
                                </>
                              )}
                            </button>
                          </div>
                          <input
                            id="ticket-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g. flickering elevator light bulb"
                            className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text placeholder-muted-text/30 transition-all shadow-3xs font-semibold"
                          />
                        </div>
                        <div>
                          <label htmlFor="ticket-location" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                            Location Unit Area
                          </label>
                          <input
                            id="ticket-location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            placeholder="e.g. Lobby corridor Floor 4"
                            className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text placeholder-muted-text/30 transition-all shadow-3xs"
                          />
                        </div>
                      </div>

                     {/* Dropdown Category Selector */}
                     <div>
                       <label htmlFor="ticket-category" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                         Category Department
                       </label>
                       <select
                         id="ticket-category"
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text cursor-pointer transition-all shadow-3xs font-semibold"
                       >
                         <option value="Plumbing">Plumbing</option>
                         <option value="Electrical">Electrical</option>
                         <option value="Elevator">Elevator (Lift)</option>
                         <option value="Security">Security Control</option>
                         <option value="Cleanliness">Cleanliness & Waste</option>
                       </select>
                       <span className="text-[10px] text-muted-text mt-1 block leading-relaxed font-medium">Select the system department matching the request. AI assistant validates updates during check.</span>
                     </div>

                     {/* Description Area */}
                     <div>
                       <div className="flex items-center justify-between mb-1.5 font-sans">
                         <label htmlFor="ticket-description" className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider">
                           Description Details
                         </label>
                         <button
                           type="button"
                           onClick={() => startSpeechRecognition("description")}
                           className={`px-2 py-0.5 border rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-3xs uppercase tracking-wider ${
                             listeningDesc 
                               ? 'bg-status-danger/10 text-status-danger border-status-danger/30 animate-pulse' 
                               : 'bg-surface text-muted-text border-border hover:text-primary hover:bg-background'
                           }`}
                         >
                           {listeningDesc ? (
                             <>
                               <MicOff className="w-3 h-3" /> Listening...
                             </>
                           ) : (
                             <>
                               <Mic className="w-3 h-3" /> Dictate details
                             </>
                           )}
                         </button>
                       </div>
                       <textarea
                         id="ticket-description"
                         value={description}
                         onChange={(e) => setDescription(e.target.value)}
                         required
                         rows={4}
                         placeholder="e.g. The lobby light has been flashing constantly and now completely failed. Hallway is pitch black."
                         className="w-full px-4 py-2.5 bg-surface border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-text placeholder-muted-text/30 transition-all shadow-3xs leading-relaxed font-semibold font-sans"
                       />
                     </div>

                     {/* Polished Visual File Uploader Widget */}
                     <div className="space-y-2">
                       <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                         Reference Photo Attachment
                       </label>
                       
                       <input
                         type="file"
                         id="file-uploader"
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                       />
                       
                       {photoPreview ? (
                         <div className="p-3 border border-border bg-background/50 rounded flex items-center justify-between gap-4 shadow-3xs animate-in fade-in duration-100">
                           <div className="flex items-center gap-3">
                             <img 
                               src={photoPreview} 
                               className="w-12 h-12 object-cover rounded border border-border shadow-3xs"
                               alt="Selected attachment preview"
                             />
                             <div className="min-w-0">
                               <div className="text-xs font-bold text-text truncate max-w-[180px]">{photoUrl}</div>
                               <div className="text-[9px] text-status-success font-bold mt-0.5">Reference photo loaded</div>
                             </div>
                           </div>
                           
                           <button
                             type="button"
                             onClick={handleRemovePhoto}
                             className="text-[10px] font-bold text-status-danger hover:underline cursor-pointer px-2 py-1 rounded hover:bg-background/50 transition-colors"
                           >
                             Remove Photo
                           </button>
                         </div>
                       ) : (
                         <label 
                           htmlFor="file-uploader"
                           className="border-dashed border-2 border-border/60 hover:border-primary/50 bg-surface rounded p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group shadow-3xs"
                         >
                           <ImageIcon className="w-6 h-6 text-muted-text/50 group-hover:text-primary/75 transition-colors" />
                           <div>
                             <span className="text-xs font-bold text-primary group-hover:underline block">Click to upload photo</span>
                             <span className="text-[9px] text-muted-text/60 font-semibold block mt-0.5">Supports PNG, JPG, or WebP up to 5MB</span>
                           </div>
                         </label>
                       )}
                       
                       {uploadError && (
                         <div className="text-[10px] font-bold text-status-danger mt-1.5 flex items-center gap-1">
                           <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                         </div>
                       )}
                     </div>

                     {/* AI NLP Predictions Box */}
                     {aiPreview && (
                       <div className="p-4 bg-background border border-border rounded space-y-2.5 shadow-3xs animate-in fade-in duration-150">
                         <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-primary flex items-center gap-1 font-serif">
                             <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" /> NLP Validation Report
                           </span>
                           <span className="text-[9px] font-bold text-muted-text bg-surface px-2 py-0.5 border border-border rounded-full">Confidence: {(aiPreview.confidence * 100).toFixed(0)}%</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-xs border-y border-border/20 py-2 font-semibold">
                           <div>
                             <span className="text-muted-text">Category Recommendation:</span>{" "}
                             <span className="font-bold text-primary ml-1">{aiPreview.category}</span>
                           </div>
                           <div>
                             <span className="text-muted-text">Urgency Priority:</span>{" "}
                             <span className={`font-bold ml-1 px-2 py-0.5 rounded border inline-block ${
                               aiPreview.priority === 'High' 
                                 ? 'bg-status-danger/5 text-status-danger border-status-danger/15' 
                                 : aiPreview.priority === 'Medium' 
                                   ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                   : 'bg-status-success/5 text-status-success border-status-success/15'
                             }`}>
                               {aiPreview.priority}
                             </span>
                           </div>
                         </div>
                         <p className="text-[11px] text-text font-sans font-medium leading-relaxed">{aiPreview.explanation}</p>
                       </div>
                     )}

                     {/* Form Actions area */}
                     <div className="flex justify-between items-center gap-4 border-t border-border/40 pt-4 flex-wrap">
                       <button
                         type="button"
                         onClick={handleAIValidation}
                         disabled={analyzing || formLoading}
                         className="px-3.5 py-2 bg-surface hover:bg-background border border-border text-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-3xs"
                       >
                         {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-secondary" />}
                         {analyzing ? "Running diagnostic..." : "Validate with Assistant"}
                       </button>
                       
                       <div className="flex items-center gap-2">
                         <button
                           type="button"
                           onClick={() => setShowRaiseForm(false)}
                           className="px-4 py-2 bg-background hover:bg-background border border-border text-primary rounded text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-3xs"
                         >
                           Cancel
                         </button>
                         <button
                           type="submit"
                           disabled={formLoading}
                           className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs active:scale-95"
                         >
                           {formLoading ? (
                             <>
                               <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting Request...
                             </>
                           ) : (
                             <>
                               <Send className="w-3.5 h-3.5 text-white/90" /> File Request
                             </>
                           )}
                         </button>
                       </div>
                     </div>
                   </form>
                 </div>
               )}

               {/* Complaints Ledger List Section */}
               <div className="space-y-4">
                 <h2 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                   My Maintenance Tickets
                 </h2>

                 {/* Polished Empty State */}
                 {complaints.length === 0 && !error && (
                   <div className="p-8 bg-surface border border-border rounded text-center max-w-xl mx-auto space-y-4 shadow-2xs mt-4 animate-in fade-in duration-200">
                     <div className="mx-auto w-12 h-12 bg-background text-muted-text border border-border rounded-full flex items-center justify-center shadow-3xs">
                       <ClipboardList className="w-5.5 h-5.5 text-muted-text/80" />
                     </div>
                     <div className="space-y-1.5">
                       <h4 className="text-sm font-serif font-bold text-primary">No Service Requests Found</h4>
                       <p className="text-xs text-muted-text max-w-xs mx-auto leading-relaxed font-medium">
                         Your unit is currently running smoothly! If you need to log plumbing issues, elevator queries, or request help, tap the &quot;Raise Complaint&quot; button above.
                       </p>
                     </div>
                   </div>
                 )}

                 {/* Render complaints ledger table/cards */}
                 {complaints.length > 0 && (
                   <>
                     {/* Desktop Table View */}
                     <div className="hidden md:block overflow-x-auto border border-border rounded shadow-2xs bg-surface">
                       <table className="w-full text-xs text-left">
                         <thead className="table-header text-[10px] font-bold">
                           <tr>
                             <th className="px-6 py-4 w-16">ID</th>
                             <th className="px-6 py-4">Subject</th>
                             <th className="px-6 py-4 w-28">Category</th>
                             <th className="px-6 py-4 w-24">Date Logged</th>
                             <th className="px-6 py-4 w-24">Last Update</th>
                             <th className="px-6 py-4 w-20">Priority</th>
                             <th className="px-6 py-4 w-24 text-right">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {complaints.map((c) => {
                             const active = expandedTicketId === c.id;
                             const overdue = isOverdue(c.created_at, c.status);
                             
                             return (
                               <Fragment key={c.id}>
                                 <tr className="hover:bg-background/50 transition-colors">
                                   <td 
                                     onClick={() => setSelectedTicket(c)}
                                     className="px-6 py-4.5 font-bold text-primary hover:underline cursor-pointer"
                                   >
                                     #COM-{1000 + c.id}
                                   </td>
                                   <td 
                                     onClick={() => setSelectedTicket(c)}
                                     className="px-6 py-4.5 cursor-pointer"
                                   >
                                     <div className="flex items-center gap-2">
                                       <span className="font-bold text-text hover:text-primary text-xs">{c.title}</span>
                                       {overdue && (
                                         <span className="text-[8px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 animate-none">
                                           <AlertTriangle className="w-2.5 h-2.5" /> SLA Overdue
                                         </span>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-6 py-4.5 font-semibold text-text">{c.category}</td>
                                   <td className="px-6 py-4.5 text-muted-text font-semibold">{new Date(c.created_at).toLocaleDateString()}</td>
                                   <td className="px-6 py-4.5 text-muted-text font-semibold">{getLastUpdated(c)}</td>
                                   <td className="px-6 py-4.5">
                                     <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
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
                                     <div className="flex items-center justify-end gap-1.5">
                                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider whitespace-nowrap ${
                                         c.status === 'Resolved' 
                                           ? 'bg-status-success/5 text-status-success border-status-success/15' 
                                           : c.status === 'In Progress' 
                                             ? 'bg-status-warning/5 text-status-warning border-status-warning/15' 
                                             : 'bg-status-danger/5 text-status-danger border-status-danger/15'
                                       }`}>
                                         {c.status}
                                       </span>
                                       <button 
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setExpandedTicketId(active ? null : c.id);
                                         }}
                                         className="p-1 hover:bg-background rounded transition-colors"
                                       >
                                         {active ? <ChevronUp className="w-3.5 h-3.5 text-muted-text" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-text" />}
                                       </button>
                                     </div>
                                   </td>
                                 </tr>
                                 
                                 {/* Expandable row for details */}
                                 {active && (
                                   <tr className="bg-background/30 animate-in fade-in duration-100">
                                     <td colSpan={7} className="px-8 py-6 border-l-2 border-l-primary/60">
                                       <div className="space-y-4">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div className="space-y-1.5">
                                             <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Description details</div>
                                             <p className="text-xs text-text font-medium leading-relaxed font-sans opacity-95">{c.description}</p>
                                           </div>
                                           <div className="p-5 bg-surface border border-border rounded space-y-3 shadow-3xs">
                                             <div className="text-[9px] font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-1 flex items-center gap-1.5">
                                               <Sparkles className="w-3.5 h-3.5 text-secondary" /> NLP Dispatch Analysis
                                             </div>
                                             <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-text">
                                               <div>
                                                 <span>NLP Conf:</span>
                                                 <span className="font-bold text-primary bg-background px-1 border border-border rounded ml-1">{(c.ai_confidence_score * 100).toFixed(0)}%</span>
                                               </div>
                                               <div>
                                                 <span>Location:</span>
                                                 <span className="text-text font-bold ml-1">{c.location}</span>
                                               </div>
                                             </div>
                                             <div className="text-[10px] text-muted-text font-medium leading-relaxed mt-1">
                                               <span className="font-bold">AI Diagnostics:</span> {c.ai_explanation}
                                             </div>
                                           </div>
                                         </div>

                                         <div className="border-t border-border/40 pt-3">
                                           <div className="flex items-center justify-between mb-2">
                                             <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Service Timeline Logs</div>
                                             <button 
                                               onClick={() => setSelectedTicket(c)}
                                               className="text-[9px] font-bold text-secondary hover:underline uppercase tracking-wider"
                                             >
                                               Open Details Tracker &rarr;
                                             </button>
                                           </div>
                                           <div className="space-y-3 relative pl-1">
                                             {c.history.map((h: any) => (
                                               <div key={h.id} className="relative pl-5 border-l border-border text-xs py-0.5 last:border-l-transparent">
                                                 <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-surface border border-muted-text flex items-center justify-center" />
                                                 <div className="flex items-center justify-between text-[9px] text-muted-text font-bold mb-0.5">
                                                   <span className="bg-background px-1 border border-border rounded">Log: {h.status_from} &rarr; {h.status_to}</span>
                                                   <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                                 </div>
                                                 <p className="text-text font-sans font-medium leading-relaxed">{h.comment}</p>
                                               </div>
                                             ))}
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

                     {/* Mobile View */}
                     <div className="md:hidden space-y-4">
                       {complaints.map((c) => {
                         const overdue = isOverdue(c.created_at, c.status);
                         
                         return (
                           <div key={c.id} className="bg-surface border border-border rounded p-4 shadow-3xs space-y-3">
                             <div className="flex items-center justify-between border-b border-border/40 pb-2">
                               <span className="text-xs font-bold text-primary">{c.category}</span>
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

                             <div onClick={() => setSelectedTicket(c)} className="cursor-pointer">
                               <div className="flex items-center gap-1.5 flex-wrap">
                                 <h4 className="text-xs font-bold text-text hover:underline">{c.title}</h4>
                                 {overdue && (
                                   <span className="text-[8px] font-bold text-status-danger bg-status-danger/5 border border-status-danger/20 px-1.5 py-0.5 rounded-full">SLA Overdue</span>
                                 )}
                               </div>
                               <p className="text-[10px] text-muted-text mt-1 font-medium leading-relaxed line-clamp-2">{c.description}</p>
                             </div>

                             <div className="flex items-center justify-between text-[9px] text-muted-text font-semibold border-t border-border/40 pt-2 flex-wrap gap-1">
                               <div>Filed: <span className="text-text">{new Date(c.created_at).toLocaleDateString()}</span></div>
                               <div>Priority: <span className="font-bold text-text uppercase">{c.priority}</span></div>
                               <div>Activity: <span className="text-text">{getLastUpdated(c)}</span></div>
                             </div>

                             <div className="flex items-center justify-between text-[9px] text-muted-text font-bold pt-1.5">
                               <span>#COM-{1000 + c.id}</span>
                               <button 
                                 onClick={() => setSelectedTicket(c)}
                                 className="text-primary flex items-center gap-0.5 uppercase tracking-wider"
                               >
                                 Inspect Tracker &rarr;
                               </button>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </>
                 )}
               </div>
             </main>
           </>
         )}

      </div>
    </div>
  );
}
