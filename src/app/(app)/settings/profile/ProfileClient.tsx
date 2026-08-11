"use client";

import { motion, Variants } from "framer-motion";
import { 
  Trophy, Flame, Zap, Edit2, 
  Target, ChevronRight, Activity, Lock, 
  Gamepad2, Medal, Crown
} from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";

export default function ProfileClient({ user }: { user: any }) {
  const isQuant = user.persona === "quant";

  // Tier Calculation
  const pts = user.totalPoints || 0;
  let tier = "Intern";
  let nextTier = "Analyst";
  let nextTierPts = 500;
  let progress = (pts / 500) * 100;

  if (pts >= 25000) { tier = "Partner"; nextTier = "Max"; nextTierPts = pts; progress = 100; }
  else if (pts >= 10000) { tier = "Director"; nextTier = "Partner"; nextTierPts = 25000; progress = ((pts - 10000) / 15000) * 100; }
  else if (pts >= 5000) { tier = "VP"; nextTier = "Director"; nextTierPts = 10000; progress = ((pts - 5000) / 5000) * 100; }
  else if (pts >= 2000) { tier = "Associate"; nextTier = "VP"; nextTierPts = 5000; progress = ((pts - 2000) / 3000) * 100; }
  else if (pts >= 500) { tier = "Analyst"; nextTier = "Associate"; nextTierPts = 2000; progress = ((pts - 500) / 1500) * 100; }

  const avgVelocity = user.averageVelocityMs ? Math.round(user.averageVelocityMs) : null;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently";

  // Animation variants
  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-32">
      
      {/* ======================= 1. PANORAMIC HERO ======================= */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-primary/5 backdrop-blur-3xl"
      >
        {/* Deep ambient lighting */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-gradient-to-r from-primary/40 to-transparent blur-[120px] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          
          {/* Left: Identity */}
          <div className="flex items-center gap-8">
            <Avatar size="xl" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                  @{user.username || "operator"}
                </h1>
                <div className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                    {isQuant ? 'Quant' : 'Gen'}
                  </span>
                </div>
              </div>
              <p className="text-xl md:text-2xl text-zinc-400 font-medium tracking-tight">
                {user.displayName || "NeuroQuant Operator"}
              </p>
              
              <div className="pt-4 flex items-center gap-4">
                <Link href="/settings/account">
                  <Button variant="secondary" size="sm" className="gap-2 group">
                    <Edit2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    Edit Profile
                  </Button>
                </Link>
                <div className="text-sm font-medium text-zinc-500">
                  Joined {joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Floating Hero Stats */}
          <div className="flex gap-8 md:gap-12">
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-400" /> Tier
              </div>
              <div className="text-4xl font-black text-white tracking-tighter">{tier}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Velocity
              </div>
              <div className="text-4xl font-black text-white tracking-tighter flex items-baseline gap-1">
                {avgVelocity ? avgVelocity : "--"} <span className="text-lg text-zinc-500 font-bold">ms</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Streak
              </div>
              <div className="text-4xl font-black text-white tracking-tighter flex items-baseline gap-1">
                {user.globalStreak} <span className="text-lg text-zinc-500 font-bold">d</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ======================= 2. PROGRESSION & COMMAND (Spans 2 cols) ======================= */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
          
          {/* Progression Panel */}
          <GlassPanel className="p-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-1">Rank Progression</h3>
                  <p className="text-sm font-medium text-zinc-400">Earn points through daily training to unlock higher tiers.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white tracking-tighter">{pts} <span className="text-sm text-zinc-500">PTS</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <span className="text-purple-400">{tier}</span>
                  <span>{nextTierPts} PTS to {nextTier}</span>
                </div>
                <ProgressBar progress={progress} className="h-3 rounded-full bg-[#050505] shadow-inner" />
              </div>
            </div>
          </GlassPanel>

          {/* Active Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/practice/reflex">
              <GlassPanel interactive hoverGlow className="p-6 group h-full flex flex-col justify-between hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tight mb-2">Reflex Engine</h4>
                  <p className="text-sm font-medium text-zinc-400">High-frequency arithmetic and speed drills.</p>
                </div>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                  Initialize <ChevronRight className="w-4 h-4" />
                </div>
              </GlassPanel>
            </Link>

            <div className="grid grid-rows-2 gap-6">
              <Link href="/practice/logic">
                <GlassPanel interactive className="p-5 group h-full flex items-center justify-between hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <h4 className="text-lg font-black text-white tracking-tight mb-1">Logic Core</h4>
                    <p className="text-xs font-medium text-zinc-400">Mental agility & rules.</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors relative z-10">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                </GlassPanel>
              </Link>

              <Link href="/practice/probability">
                <GlassPanel interactive className="p-5 group h-full flex items-center justify-between hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <h4 className="text-lg font-black text-white tracking-tight mb-1">Risk Lab</h4>
                    <p className="text-xs font-medium text-zinc-400">Probability models.</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-colors relative z-10">
                    <Activity className="w-5 h-5 text-orange-500" />
                  </div>
                </GlassPanel>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ======================= 3. SIDECAR (Diagnostics & Achievements) ======================= */}
        <motion.div variants={fadeUp} className="space-y-6">
          
          {/* Diagnostic Baseline */}
          <GlassPanel className="p-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Medal className="w-4 h-4 text-zinc-400" /> Baseline Metric
            </h3>
            
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">Diagnostic system is currently offline for upgrades.</p>
            </div>
          </GlassPanel>

          {/* Achievements Vault */}
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">The Vault</h3>
              <span className="text-xs font-bold text-zinc-600 bg-white/5 px-2 py-1 rounded-md">Locked</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <Lock className="w-5 h-5 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                </div>
              ))}
            </div>
          </GlassPanel>

        </motion.div>
      </motion.div>

    </div>
  );
}
