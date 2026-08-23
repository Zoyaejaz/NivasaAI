"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder = "••••••••", 
  label = "Password", 
  required = true 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-[10px] font-bold text-primary/85 uppercase tracking-wider mb-1.5 font-sans">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-text/50 pointer-events-none">
          <Lock className="w-3.5 h-3.5" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2 bg-white border border-border rounded text-xs text-text placeholder-muted-text/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-3xs font-semibold"
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
  );
}
