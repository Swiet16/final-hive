// Life Hive brand logo — animated hexagon hive mark + wordmark.
// Sized via `className` on the wrapper.
import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="hive-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="hive-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#hive-g)" />
        {/* Outer hive hex */}
        <path
          d="M32 12 L48 21 L48 39 L32 48 L16 39 L16 21 Z"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Inner hex */}
        <path
          d="M32 22 L40 26.5 L40 35.5 L32 40 L24 35.5 L24 26.5 Z"
          fill="white"
          opacity="0.95"
        />
        <circle cx="32" cy="31" r="3.5" fill="url(#hive-a)" />
      </svg>
    </span>
  );
}

export function Logo({
  className = "",
  to = "/",
  showText = true,
  textClassName = "text-xl",
}: {
  className?: string;
  to?: string;
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
        <LogoMark className="size-8 sm:size-9" />
      </span>
      {showText && (
        <span className={`font-brand font-extrabold tracking-tight ${textClassName}`}>
          <span className="text-gradient-hive">Life</span>
          <span className="text-foreground"> Hive</span>
        </span>
      )}
    </Link>
  );
}
