"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Users, CreditCard, Sparkles, Trophy, LogOut, MessageSquare } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import { createBrowserClient } from "@supabase/ssr";
import { Avatar } from "@/components/ui/Avatar";

export function UserDropdown() {
  const user = useGlobalStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const menuItems = [
    { label: "Profile", icon: User, href: "/settings/profile" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Referral", icon: Users, href: "/settings/referral" },
    { label: "Subscription", icon: CreditCard, href: "/settings/subscription" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "Feedback / Support", icon: MessageSquare, href: "/settings/support" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center ml-2 border border-zinc-800 hover:border-primary/50 transition-colors relative overflow-hidden group shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-sm font-bold text-zinc-300 group-hover:text-primary transition-colors uppercase">
          {user?.persona === "quant" ? "Q" : user?.persona === "generalist" ? "G" : "U"}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 mt-3 w-64 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Avatar size="md" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">
                    {user?.displayName || "Operator"}
                  </span>
                  <span className="text-xs text-primary mt-0.5 font-medium">
                    @{user?.username || "user"}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all">
                      <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    {item.label}
                  </motion.div>
                </Link>
              ))}

              <div className="h-px bg-white/5 my-1" />

              {/* Log Out */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ x: 4, backgroundColor: "rgba(239,68,68,0.1)" }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 transition-colors w-full text-left group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all">
                  <LogOut className="w-4 h-4" />
                </div>
                Log Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
