"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Trophy, Settings } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Reflex", href: "/practice/reflex", icon: Brain },
  { name: "Rank", href: "#", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav during active sessions
  if (pathname.includes("/session") || pathname.includes("/sudden-death")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0c10]/95 backdrop-blur-md border-t border-white/5 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
