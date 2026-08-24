import React from "react";

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function LogoIcon({ className, ...props }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer Circle */}
      <circle cx="50" cy="50" r="42" />
      {/* Base line */}
      <path d="M 30 76 L 70 76" />
      {/* Main symbol shape */}
      <path d="M 15 55 L 35 55 L 35 76" />
      <path d="M 35 55 L 50 24 L 65 55" />
      <path d="M 65 55 L 65 76" />
      <path d="M 65 55 L 85 55" />
    </svg>
  );
}
