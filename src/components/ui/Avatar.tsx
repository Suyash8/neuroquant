import React from "react";
import { User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16"
  };

  return (
    <div className={cn("relative group", sizes[size], className)}>
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-colors duration-500" />
      <div className="absolute inset-0 border-2 border-primary/30 rounded-full overflow-hidden shadow-primary-glow">
        <div className="w-full h-full bg-[#050505] flex items-center justify-center">
          <User className={cn("text-primary opacity-50", iconSizes[size])} />
        </div>
      </div>
    </div>
  );
}
