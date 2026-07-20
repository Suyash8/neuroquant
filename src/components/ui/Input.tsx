import React, { InputHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, ...props }, ref) => {
    return (
      <div className="space-y-3 w-full">
        {label && (
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-primary/50 focus:shadow-primary-glow",
              icon && "pl-11",
              error && "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
