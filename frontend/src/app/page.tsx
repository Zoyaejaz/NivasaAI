import Link from "next/link";
import { ShieldCheck, Activity, Brain, ArrowRight, Zap, RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Nivasa<span className="text-blue-500">AI</span></span>
        </div>
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
        >
          Access Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 text-center py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" /> Next-Generation Society Operations
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Intelligent Operations & <br/>
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Predictive Maintenance
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-12 leading-relaxed">
          NivasaAI transforms residential communities from reactive complaint management into intelligent, data-driven and predictive maintenance operations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/login"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transform hover:-translate-y-0.5"
          >
            Launch Platform <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium rounded-xl transition-all flex items-center justify-center"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full border-t border-zinc-900 pt-16">
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="text-4xl font-extrabold text-blue-500 mb-2">98.4%</div>
            <div className="text-sm font-semibold text-zinc-300 mb-1">SLA Compliance</div>
            <div className="text-xs text-zinc-500">Overdue detection & automated alerts</div>
          </div>
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="text-4xl font-extrabold text-indigo-400 mb-2">&lt; 2.4 hrs</div>
            <div className="text-sm font-semibold text-zinc-300 mb-1">Avg Resolution Time</div>
            <div className="text-xs text-zinc-500">Dynamic routing & priority predictions</div>
          </div>
          <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl glass">
            <div className="text-4xl font-extrabold text-emerald-400 mb-2">40%</div>
            <div className="text-sm font-semibold text-zinc-300 mb-1">Asset Downtime Savings</div>
            <div className="text-xs text-zinc-500">Predictive risk scoring & early diagnostics</div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-center text-white mb-16">Platform Core Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">AI Complaint Classification</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Auto-predicts category, priorities, and provides explanation recommendations from natural language descriptions and optional photo scanning diagnostics.
            </p>
          </div>

          <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Predictive Maintenance</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Computes health degradation and risk scores for critical society assets based on operational load patterns, age decay, and maintenance delays.
            </p>
          </div>

          <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col items-start text-left">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">RAG Admin AI Assistant</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Empowers administrators with a natural language interface querying databases for volume trends, recurring logs, and notice board broadcasts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-zinc-600 border-t border-zinc-900">
        &copy; {new Date().getFullYear()} NivasaAI. All rights reserved.
      </footer>
    </div>
  );
}
