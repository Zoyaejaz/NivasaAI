"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building, User, Home, Phone, ArrowLeft, Mail, AlertCircle, Loader2, CheckCircle2, Sparkles, X 
} from "lucide-react";
import PasswordInput from "./PasswordInput";
import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIsSignUp?: boolean;
}

export default function AuthModal({ isOpen, onClose, defaultIsSignUp = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"resident" | "admin">("resident");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleQuickFill = (selectedRole: "resident" | "admin") => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setEmail("admin@nivasa.ai");
      setPassword("admin123");
    } else {
      setEmail("resident@nivasa.ai");
      setPassword("resident123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        // Register Call
        await api.post("/api/auth/register", {
          email,
          password,
          full_name: fullName,
          role,
          flat_number: flatNumber || null,
          phone_number: phoneNumber || null,
        });

        setSuccess("Account created successfully! You can now log in.");
        setIsSignUp(false);
        setFullName("");
        setFlatNumber("");
        setPhoneNumber("");
      } else {
        // Login Call
        const data = await api.post("/api/auth/login", { email, password });
        
        // Save Token and user details
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onClose();

        // Redirect depending on user role
        if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/resident");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong, please check your input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-transparent cursor-default" 
        onClick={onClose} 
      />
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-border bg-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-text hover:text-primary p-1 cursor-pointer transition-colors"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding & Logo */}
        <div className="text-center">
          <div className="inline-flex p-2.5 bg-primary rounded shadow-3xs mb-3">
            <Building className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-primary font-sans">
            Nivasa<span className="font-sans text-secondary font-normal italic ml-0.5">AI</span> Portal
          </h2>
          <p className="text-[10.5px] text-muted-text mt-1.5 font-medium leading-relaxed max-w-xs mx-auto">
            {isSignUp ? "Register a new profile to join the community portal" : "Sign in to access your community dashboard"}
          </p>
        </div>

        {/* Success/Error displays */}
        {error && (
          <div className="p-3 bg-status-danger/5 border border-status-danger/25 rounded flex items-start gap-2.5 text-status-danger text-xs animate-in fade-in duration-100 font-sans">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-status-danger" />
            <div className="font-semibold leading-relaxed">
              <span className="font-bold">Access Issue:</span> {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-status-success/5 border border-status-success/25 rounded flex items-start gap-2.5 text-status-success text-xs animate-in fade-in duration-100 font-sans">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-status-success" />
            <div className="font-semibold leading-relaxed">
              <span className="font-bold">Success:</span> {success}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-4 animate-in fade-in duration-100 font-sans">
              <div>
                <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                    Flat / Unit
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
                      <Home className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      required
                      placeholder="e.g. Wing B-402"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 98765"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="font-sans">
            <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
              />
            </div>
          </div>

          <PasswordInput 
            value={password}
            onChange={setPassword}
            label="Password"
          />

          {/* Role selection (Resident vs Admin toggle) - Only show during sign in */}
          {!isSignUp && (
            <div className="font-sans">
              <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                Account Level Role
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 border border-border rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("resident")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === "resident"
                      ? "bg-white text-primary border border-border/80 shadow-3xs font-bold"
                      : "text-muted-text hover:text-primary"
                  }`}
                >
                  Resident
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === "admin"
                      ? "bg-white text-primary border border-border/80 shadow-3xs font-bold"
                      : "text-muted-text hover:text-primary"
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>
          )}

          {/* Quick login hint (Only in sign in mode) */}
          {!isSignUp && (
            <div className="text-center pt-1.5 font-sans">
              <button
                type="button"
                onClick={() => handleQuickFill(role)}
                className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/85 font-bold transition-all cursor-pointer hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" /> Load default demo {role} credentials
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-2xs flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50 cursor-pointer mt-6 font-sans"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating...
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4 font-sans">
          <button
            type="button"
            onClick={() => {
              const newIsSignUp = !isSignUp;
              setIsSignUp(newIsSignUp);
              if (newIsSignUp) {
                setRole("resident");
              }
              setError("");
              setSuccess("");
            }}
            className="text-xs text-muted-text hover:text-primary font-semibold transition-all cursor-pointer"
          >
            {isSignUp ? (
              <span className="flex items-center justify-center gap-1.5 font-bold text-primary">
                <ArrowLeft className="w-3.5 h-3.5 text-primary" /> Back to Sign In
              </span>
            ) : (
              <>
                Don&apos;t have an account? <span className="text-secondary hover:underline font-bold">Sign Up</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
