import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { LucideIcon, ArrowRight, Play } from "lucide-react";
import { Card } from "./Card";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorTheme?: "primary" | "orange" | "blue" | "purple";
  badgeText?: string;
  difficulty?: "Beginner" | "Intermediate" | "Expert" | "Adaptive" | "Custom";
  metrics?: { label: string; value: string | number }[];
  className?: string;
}

export function GameCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  colorTheme = "primary", 
  badgeText,
  difficulty,
  metrics,
  className 
}: GameCardProps) {
  
  const themeConfig = {
    primary: {
      bg: "from-zinc-900 to-zinc-950 hover:to-zinc-900 border-primary/10 hover:border-primary/30",
      accent: "bg-primary/20",
      text: "text-primary",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,255,157,0.15)]",
      button: "bg-primary hover:bg-primary/90 text-black",
      iconBg: "bg-primary/10 border-primary/20",
    },
    orange: {
      bg: "from-zinc-900 to-zinc-950 hover:to-zinc-900 border-orange-500/10 hover:border-orange-500/30",
      accent: "bg-orange-500/20",
      text: "text-orange-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
      button: "bg-orange-500 hover:bg-orange-600 text-black",
      iconBg: "bg-orange-500/10 border-orange-500/20",
    },
    blue: {
      bg: "from-zinc-900 to-zinc-950 hover:to-zinc-900 border-blue-500/10 hover:border-blue-500/30",
      accent: "bg-blue-500/20",
      text: "text-blue-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      button: "bg-blue-500 hover:bg-blue-600 text-white",
      iconBg: "bg-blue-500/10 border-blue-500/20",
    },
    purple: {
      bg: "from-zinc-900 to-zinc-950 hover:to-zinc-900 border-purple-500/10 hover:border-purple-500/30",
      accent: "bg-purple-500/20",
      text: "text-purple-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      button: "bg-purple-500 hover:bg-purple-600 text-white",
      iconBg: "bg-purple-500/10 border-purple-500/20",
    }
  };

  const currentTheme = themeConfig[colorTheme];

  return (
    <Card className={cn(
      "relative overflow-hidden group flex flex-col h-full transition-all duration-500 bg-gradient-to-b border",
      currentTheme.bg,
      currentTheme.glow,
      className
    )}>
      <div className={cn("absolute top-0 left-0 w-full h-1 transition-all duration-500 opacity-50 group-hover:opacity-100", currentTheme.accent)} />
      
      <div className="p-8 flex flex-col h-full z-10">
        <div className="flex justify-between items-start mb-12">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border relative z-10 group-hover:scale-110 transition-transform duration-500",
            currentTheme.iconBg,
            currentTheme.text
          )}>
            <Icon className="w-8 h-8" />
          </div>
          
          {badgeText && (
            <div className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-white/5 backdrop-blur-md shadow-sm",
              currentTheme.accent,
              currentTheme.text
            )}>
              {badgeText}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">{title}</h3>
          <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>

        {(metrics || difficulty) && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-8">
            {metrics?.map((m, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={currentTheme.text}>{m.value}</span> {m.label}
              </span>
            ))}
            {difficulty && (
              <span className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
                ★ {difficulty}
              </span>
            )}
          </div>
        )}

        <Link href={href} className="mt-auto block">
          <button className={cn(
            "w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg",
            currentTheme.button
          )}>
            <Play className={cn("w-5 h-5", colorTheme === 'primary' || colorTheme === 'orange' ? 'fill-black' : 'fill-white')} /> 
            Play Now 
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </Card>
  );
}
