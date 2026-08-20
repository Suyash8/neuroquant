"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  hoverGlow?: boolean;
  danger?: boolean;
}

export function GlassPanel({
  children,
  className,
  interactive = false,
  hoverGlow = false,
  danger = false,
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-[2rem] backdrop-blur-2xl transition-all duration-500 overflow-hidden",
        // Base Glass Styles
        danger 
          ? "bg-red-500/[0.02] border border-red-500/10" 
          : "bg-white/[0.015] border border-white/5",
        // Interactive Hover Styles
        interactive && !danger && "hover:border-white/10 cursor-pointer",
        interactive && danger && "hover:border-red-500/30 cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
        // Hover Glow (Uses CSS variables from global theme)
        hoverGlow && !danger && "hover:border-primary/30 hover:shadow-primary-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
