"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";

export default function Unauthorized() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-text px-4 py-12 font-sans overflow-hidden">
      
      {/* Background decoration - subtle organic grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md p-8 rounded border border-border bg-surface shadow-xs text-center space-y-6">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center">
          <div className="inline-flex p-2 bg-background border border-border/40 rounded mb-2.5">
            <LogoIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-serif font-bold tracking-tight text-primary">
            Nivasa<span className="font-sans font-normal text-secondary italic">AI</span>
          </span>
        </div>

        {/* Lock Shield Icon Area */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-status-danger/5 border border-status-danger/25 rounded-full flex items-center justify-center text-status-danger animate-pulse shadow-3xs">
            <ShieldAlert className="w-6.5 h-6.5 text-status-danger" />
          </div>
          <h1 className="text-base font-serif font-bold text-primary tracking-tight">Access Restricted</h1>
          <p className="text-xs text-muted-text max-w-xs leading-relaxed font-medium">
            Your current account level does not have administrative clearance to access this operations console. If you believe this is an error, please coordinate with the society management committee.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40/60">
          <Link
            href="/dashboard/resident"
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-2xs flex items-center justify-center gap-1.5 transform active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Resident Portal
          </Link>
          <Link
            href="/login"
            className="w-full py-2 bg-surface hover:bg-background border border-border text-primary text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-3xs flex items-center justify-center cursor-pointer"
          >
            Sign In with different account
          </Link>
        </div>

      </div>
    </div>
  );
}
