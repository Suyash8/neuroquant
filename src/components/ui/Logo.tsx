export function Logo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const outerSize = size === "sm" 
    ? "w-7 h-7" 
    : size === "lg" 
      ? "w-16 h-16" 
      : "w-10 h-10";
      
  return (
    <div className={`${outerSize} flex items-center justify-center transform rotate-12 ${className}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#logo-grad)" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="2.5" fill="var(--primary)" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
