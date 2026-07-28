import React from "react";
import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary", 
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      "p-6 flex flex-col justify-between h-full bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors border border-white/5 relative overflow-hidden group", 
      className
    )}>
      {/* Subtle background glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity rounded-full",
        iconColor.replace('text-', 'bg-')
      )} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <span className="text-sm font-bold text-zinc-400 tracking-wider">{title}</span>
        </div>
        
        {trend && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-md",
            trend.isPositive ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
          )}>
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-white tracking-tight relative z-10">
        {value}
      </div>
    </Card>
  );
}
