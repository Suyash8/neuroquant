"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "relative font-black tracking-widest uppercase transition-all duration-300 rounded-xl flex items-center justify-center whitespace-nowrap overflow-hidden";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-[1.02] active:scale-95 shadow-inner hover:shadow-primary-glow",
    secondary: "bg-white/5 text-zinc-300 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-95",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    ghost: "bg-transparent text-zinc-400 border border-transparent hover:text-white hover:bg-white/5 active:scale-95"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
