"use client";

import { useState } from "react";
import { ArrowRight, Building, CheckCircle2, Clipboard, Activity, ShieldCheck, Brain } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Subtle organic linen grid pattern overlay - understated backdrop with a smooth fade out */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.06] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" 
        style={{
          maskImage: "linear-gradient(to bottom, black 30%, transparent 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 60%)"
        }}
      />
      
      {/* Header - Floating Capsule Navbar */}
      <header className="sticky top-4 z-20 w-full max-w-7xl mx-auto px-8 py-3.5 flex items-center justify-between border border-border bg-surface/90 backdrop-blur-md rounded-full shadow-md mt-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-3xs border border-white/10">
            <Building className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-serif tracking-tight text-primary font-bold">
            Nivasa<span className="font-sans font-normal text-secondary italic ml-0.5">AI</span>
          </span>
        </div>
        
        {/* Center/Right Links */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setShowAuthPopup(true)}
            className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/95 text-white rounded-full transition-all cursor-pointer shadow-3xs active:scale-95"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 text-center py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface border border-border text-muted-text text-[10px] font-bold uppercase tracking-wider rounded mb-6 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Operational Command Center for Property Committees
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-primary mb-6 leading-tight">
          Professional Property Operations & <br/>
          <span className="font-serif italic font-normal text-secondary">
            Predictive Infrastructure Care
          </span>
        </h1>

        <p className="text-sm text-muted-text max-w-xl mb-10 leading-relaxed font-medium">
          NivasaAI enables residential estates to transition from chaotic, reactive ticketing to highly organized, structured management and maintenance operations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-20 w-full sm:w-auto justify-center px-4">
          <button
            onClick={() => setShowAuthPopup(true)}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
          >
            Launch Platform Portal <ArrowRight className="w-4 h-4 text-white/80" />
          </button>
          <a
            href="#features"
            className="px-6 py-3 bg-surface hover:bg-background border border-border text-primary font-bold rounded transition-colors text-xs uppercase tracking-wider shadow-2xs"
          >
            Explore System Modules
          </a>
        </div>

        {/* Stats Grid */}
        <div id="stats" className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full border-t border-border pt-16 scroll-mt-24">
          <div className="p-6 bg-surface border border-border rounded flex flex-col items-center shadow-2xs hover:border-slate-300 transition-colors">
            <div className="text-3xl font-serif text-secondary font-black mb-1.5">98.4%</div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">SLA Target Met</div>
            <div className="text-xs text-muted-text text-center max-w-[200px] leading-relaxed font-medium">Strict oversight on overdue maintenance requests</div>
          </div>
          <div className="p-6 bg-surface border border-border rounded flex flex-col items-center shadow-2xs hover:border-slate-300 transition-colors">
            <div className="text-3xl font-serif text-primary font-black mb-1.5">&lt; 2.4 Hrs</div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Mean Resolution Time</div>
            <div className="text-xs text-muted-text text-center max-w-[200px] leading-relaxed font-medium">Smart categorization & dispatch workflows</div>
          </div>
          <div className="p-6 bg-surface border border-border rounded flex flex-col items-center shadow-2xs hover:border-slate-300 transition-colors">
            <div className="text-3xl font-serif text-primary font-black mb-1.5">35% Reduction</div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Machinery Downtime</div>
            <div className="text-xs text-muted-text text-center max-w-[200px] leading-relaxed font-medium">Continuous health analysis of boilers, pumps & generators</div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 scroll-mt-24">
        <h2 className="text-2xl font-serif font-bold text-center text-primary mb-12">Core Operational Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-border rounded flex flex-col items-start text-left shadow-2xs hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-background text-primary rounded mb-5 border border-border">
              <Clipboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-primary mb-2">Resident Service Dispatch</h3>
            <p className="text-xs text-muted-text leading-relaxed font-medium">
              Provides residents with a simple interface to file plumbing, electrical, elevator, and security requests. Features real-time dispatch logs and SLA reminders.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded flex flex-col items-start text-left shadow-2xs hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-background text-primary rounded mb-5 border border-border">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-primary mb-2">Predictive Asset Maintenance</h3>
            <p className="text-xs text-muted-text leading-relaxed font-medium">
              Dynamically evaluates equipment degradation based on usage intensity, log history, and age indicators to suggest tune-ups before costly repairs occur.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded flex flex-col items-start text-left shadow-2xs hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-background text-secondary rounded mb-5 border border-border">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-primary mb-2">Integrated Notice Broadcasting</h3>
            <p className="text-xs text-muted-text leading-relaxed font-medium">
              Keeps the entire community aligned. Allows the management committee to broadcast pinned bulletins, water shutdowns, or maintenance notices instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative z-10 w-full border-t border-border bg-surface md:border-x max-w-7xl mx-auto px-10 py-16 font-sans scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-serif tracking-tight text-primary font-bold">
                Nivasa<span className="font-sans font-normal text-secondary italic ml-0.5">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-text leading-relaxed font-semibold">
              Leveraging next-gen artificial intelligence to power estate ticket operations, asset longevity analysis, and community bulletins.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Operations</h4>
            <ul className="space-y-2.5 text-[11px] text-muted-text font-semibold">
              <li><button onClick={() => setShowAuthPopup(true)} className="hover:text-primary transition-colors cursor-pointer">Resident Portal</button></li>
              <li><button onClick={() => setShowAuthPopup(true)} className="hover:text-primary transition-colors cursor-pointer">Admin Dashboard</button></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Infrastructure Logs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[11px] text-muted-text font-semibold">
              <li><a href="#features" className="hover:text-primary transition-colors">SLA Tracking</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Notice Bulletin</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Predictive Analytics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Security</h4>
            <ul className="space-y-2.5 text-[11px] text-muted-text font-semibold">
              <li><span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-secondary" /> AES-256 JWT Link</span></li>
              <li><span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-primary" /> Neon DB Secured</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 mt-12 pt-6 text-center text-[10px] font-bold text-muted-text uppercase tracking-wider">
          &copy; {new Date().getFullYear()} NivasaAI Community Systems. All rights reserved.
        </div>
      </footer>

      {/* Modal Dialog Portal Popup */}
      <AuthModal isOpen={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
    </div>
  );
}
