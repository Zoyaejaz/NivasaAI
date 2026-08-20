"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Mail, Lock, AlertCircle, Loader2, User, Home, Phone, ArrowLeft } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 overflow-hidden px-4 py-8">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-zinc-900 bg-zinc-900/40 glass shadow-2xl">
        
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">NivasaAI Portal</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {isSignUp ? "Create a new profile to join the society" : "Sign in to manage your residential operations"}
          </p>
        </div>

        {/* Success/Error displays */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-red-400 text-xs mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Action failed:</span> {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-start gap-2.5 text-emerald-400 text-xs mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Success:</span> {success}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-sm placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Flat / Unit Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                    <Home className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    required
                    placeholder="e.g. Tower 1-402"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-sm placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-sm placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-sm placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-sm placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
              />
            </div>
          </div>

          {/* Role selection (Resident vs Admin toggle) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950/60 rounded-xl border border-zinc-900">
              <button
                type="button"
                onClick={() => setRole("resident")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === "resident"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Resident
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === "admin"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Quick login hint (Only in sign in mode) */}
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleQuickFill(role)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
              >
                Fill default {role} credentials
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center border-t border-zinc-900/60 pt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="text-xs text-zinc-400 hover:text-white transition-all"
          >
            {isSignUp ? (
              <span className="flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </span>
            ) : (
              <>
                Don't have an account? <span className="text-blue-400 hover:underline font-semibold">Sign Up</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
