import React from "react";
import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, iconColor = "text-primary", className }: StatCardProps) {
  return (
    <Card className={cn("p-4 flex flex-col justify-between h-full bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors", className)}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={cn("w-5 h-5", iconColor)} />}
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
      </div>
    </Card>
  );
}
