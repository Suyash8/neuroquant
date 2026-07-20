import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Toggle({ checked, onChange, className }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors border shadow-inner",
        checked ? "bg-primary border-primary/20 shadow-primary-glow" : "bg-[#050505] border-white/10",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300",
          checked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  );
}
