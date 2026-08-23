"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Mail, Lock, AlertCircle, Loader2, User, Home, Phone, ArrowLeft, CheckCircle2, Sparkles, Eye, EyeOff } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"resident" | "admin">("resident");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Quick seed fill helper (Only for sign in)
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
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role,
            flat_number: flatNumber || null,
            phone_number: phoneNumber || null,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Registration failed");
        }

        setSuccess("Account created successfully! You can now log in.");
        setIsSignUp(false);
        setFullName("");
        setFlatNumber("");
        setPhoneNumber("");
      } else {
        // Login Call
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Authentication failed");
        }

        const data = await response.json();
        
        // Save Token and user details
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

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
    <div className="relative min-h-screen flex items-center justify-center bg-background text-text px-4 py-12 font-sans overflow-hidden">
      
      {/* Background decoration - subtle organic grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#5B665E_1px,transparent_1px),linear-gradient(to_bottom,#5B665E_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md p-8 rounded border border-border bg-surface shadow-xs space-y-6">
        
        {/* Branding & Logo */}
        <div className="text-center">
          <div className="inline-flex p-2.5 bg-primary rounded shadow-3xs mb-3">
            <Building className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-primary">
            Nivasa<span className="font-sans text-secondary font-normal italic ml-0.5">AI</span> Portal
          </h2>
          <p className="text-[10.5px] text-muted-text mt-1.5 font-medium leading-relaxed max-w-xs mx-auto">
            {isSignUp ? "Register a new profile to join the community portal" : "Sign in to access your community dashboard"}
          </p>
        </div>

        {/* Success/Error displays */}
        {error && (
          <div className="p-3 bg-status-danger/5 border border-status-danger/25 rounded flex items-start gap-2.5 text-status-danger text-xs animate-in fade-in duration-100">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-status-danger" />
            <div className="font-semibold leading-relaxed">
              <span className="font-bold">Access Issue:</span> {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-status-success/5 border border-status-success/25 rounded flex items-start gap-2.5 text-status-success text-xs animate-in fade-in duration-100">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-status-success" />
            <div className="font-semibold leading-relaxed">
              <span className="font-bold">Success:</span> {success}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-4 animate-in fade-in duration-100">
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
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
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
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
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
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
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
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-surface border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text/50 hover:text-primary transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Role selection (Resident vs Admin toggle) - Only show during sign in */}
          {!isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5">
                Account Level Role
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-background border border-border rounded">
                <button
                  type="button"
                  onClick={() => setRole("resident")}
                  className={`py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                    role === "resident"
                      ? "bg-surface text-primary border border-border/80 shadow-3xs font-bold"
                      : "text-muted-text hover:text-primary"
                  }`}
                >
                  Resident
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                    role === "admin"
                      ? "bg-surface text-primary border border-border/80 shadow-3xs font-bold"
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
            <div className="text-center pt-1.5">
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
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-2xs flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50 cursor-pointer mt-6"
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
        <div className="mt-6 text-center border-t border-border/40 pt-4">
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
