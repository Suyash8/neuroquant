import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card } from "./Card";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorTheme?: "primary" | "orange" | "blue" | "purple";
  className?: string;
}

export function GameCard({ title, description, href, icon: Icon, colorTheme = "primary", className }: GameCardProps) {
  const themeStyles = {
    primary: "from-zinc-800/50 to-zinc-900 hover:border-primary/30 group-hover:bg-primary",
    orange: "from-zinc-800/50 to-zinc-900 hover:border-orange-500/30 group-hover:bg-orange-500",
    blue: "from-zinc-800/50 to-zinc-900 hover:border-blue-500/30 group-hover:bg-blue-500",
    purple: "from-zinc-800/50 to-zinc-900 hover:border-purple-500/30 group-hover:bg-purple-500",
  };

  const lineStyles = {
    primary: "bg-primary/20 group-hover:bg-primary",
    orange: "bg-orange-500/20 group-hover:bg-orange-500",
    blue: "bg-blue-500/20 group-hover:bg-blue-500",
    purple: "bg-purple-500/20 group-hover:bg-purple-500",
  };

  const textStyles = {
    primary: "text-primary group-hover:text-primary",
    orange: "text-orange-500 group-hover:text-orange-500",
    blue: "text-blue-500 group-hover:text-blue-500",
    purple: "text-purple-500 group-hover:text-purple-500",
  };

  return (
    <Link href={href}>
      <Card className={cn(
        "p-5 bg-gradient-to-b hover:from-zinc-800 hover:to-zinc-800 transition-all group relative overflow-hidden flex flex-col justify-between h-full cursor-pointer",
        themeStyles[colorTheme],
        className
      )}>
        <div className={cn("absolute top-0 left-0 w-full h-1 transition-colors", lineStyles[colorTheme])} />
        <div>
          <Icon className={cn("w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-500", textStyles[colorTheme])} />
          <h4 className={cn("font-bold mb-1 text-lg transition-colors text-white", textStyles[colorTheme])}>{title}</h4>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
        <div className={cn("mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity", textStyles[colorTheme])}>
          Enter <ArrowRight className="w-3 h-3" />
        </div>
      </Card>
    </Link>
  );
}
