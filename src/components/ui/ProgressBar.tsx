import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  showLaser?: boolean;
}

export function ProgressBar({ progress, className, showLaser = true }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn("h-1 bg-white/10 w-full overflow-hidden relative", className)}>
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {showLaser && clampedProgress > 0 && (
        <motion.div
          className="absolute top-0 h-full w-[2px] bg-white shadow-[0_0_10px_var(--primary)] z-10"
          initial={{ left: 0 }}
          animate={{ left: `calc(${clampedProgress}% - 1px)` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
