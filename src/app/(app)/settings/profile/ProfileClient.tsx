"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Flame, Target, Star, Mail, Calendar, 
  GraduationCap, Briefcase, Zap, Edit2, 
  ChevronDown, ChevronUp, Lock, CheckCircle2, Shield
} from "lucide-react";

export default function ProfileClient({ user }: { user: any }) {
  const [isHowToLevelUpOpen, setIsHowToLevelUpOpen] = useState(false);

  const personaColor = user.persona === "quant" ? "from-[#00FF9D]/20 to-[#00FF9D]/5" : "from-orange-500/20 to-orange-500/5";
  const personaText = user.persona === "quant" ? "text-[#00FF9D]" : "text-orange-500";
  const personaBg = user.persona === "quant" ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "bg-orange-500/10 text-orange-500";

  // Mock data for the static parts
  const skills = ["Mental Math", "Estimation", "Probability", "Logic", "Pattern Recognition"];
  const breakingIn = ["Jane Street", "Citadel", "Optiver", "Two Sigma"];
  
  // Calculate Level based on points (e.g. 100 pts per level for early levels)
  const currentLevel = Math.max(1, Math.floor(user.totalPoints / 100));
  const pointsToNextLevel = (currentLevel * 100) - user.totalPoints;
  const levelProgress = ((user.totalPoints % 100) / 100) * 100;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* LEFT COLUMN - Identity & Info */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-6">
        
        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden relative"
        >
          {/* Banner Gradient */}
          <div className={`h-24 bg-gradient-to-r ${personaColor} relative`}>
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
              {user.persona}
            </div>
          </div>
          
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-[#09090b] border-4 border-[#121214] -mt-12 mb-4 relative flex items-center justify-center shadow-xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${personaColor} opacity-50`} />
              <span className={`text-4xl font-black ${personaText}`}>
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </span>
              <div className={`absolute bottom-0 right-0 w-6 h-6 ${personaBg} rounded-tl-xl flex items-center justify-center`}>
                <Shield className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                @{user.username || "operator"}
              </h2>
              <p className="text-sm text-zinc-400 font-medium">{user.displayName || "NeuroQuant User"}</p>
            </div>

            <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/5 flex items-center justify-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit profile
            </button>
          </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121214] border border-white/5 rounded-3xl p-6 space-y-6"
        >
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Basic Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>Joined June 2026</span>
            </div>
            
            <div className="h-px w-full bg-white/5 my-2" />
            
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <GraduationCap className="w-4 h-4 text-zinc-500" />
              <span>Student level</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Briefcase className="w-4 h-4 text-zinc-500" />
              <span>Targeting Prop Trading</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500">Breaking In</h4>
            <div className="flex flex-wrap gap-2">
              {breakingIn.map((firm) => (
                <span key={firm} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-zinc-400 border border-white/5">
                  {firm}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121214] border border-white/5 rounded-3xl p-6 space-y-4"
        >
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-default border border-white/5">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

      </div>

      {/* RIGHT COLUMN - Stats & Journey */}
      <div className="flex-1 space-y-6">
        
        {/* Top 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Level" 
            value={currentLevel.toString()} 
            icon={<Trophy className="w-5 h-5 text-blue-400" />}
            subtitle={`${user.totalPoints} PTS`}
            progress={levelProgress}
            progressText={`${pointsToNextLevel} PTS to Level ${currentLevel + 1}`}
            delay={0.1}
          />
          <StatCard 
            title="Global Rank" 
            value="#---" 
            icon={<Trophy className="w-5 h-5 text-yellow-500" />}
            subtitle="Top 1%"
            delay={0.2}
          />
          <StatCard 
            title="Reflex Velocity" 
            value={user.reflexProfile?.averageVelocityMs ? `${Math.round(user.reflexProfile.averageVelocityMs)}ms` : "N/A"} 
            icon={<Zap className="w-5 h-5 text-[#00FF9D]" />}
            subtitle={user.reflexProfile?.accuracy ? `${Math.round(user.reflexProfile.accuracy)}% accuracy` : "No data"}
            delay={0.3}
          />
          <StatCard 
            title="Streak" 
            value={`${user.globalStreak} days`} 
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            subtitle={user.globalStreak > 3 ? "On fire!" : "Keep going!"}
            delay={0.4}
          />
        </div>

        {/* How to Level Up Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden"
        >
          <button 
            onClick={() => setIsHowToLevelUpOpen(!isHowToLevelUpOpen)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold flex items-center gap-2">
                  How to Level Up
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400">Tips</span>
                </h3>
                <p className="text-sm text-zinc-400">Points, multipliers, and tiers explained</p>
              </div>
            </div>
            {isHowToLevelUpOpen ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>
          
          <AnimatePresence>
            {isHowToLevelUpOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5"
              >
                <div className="p-6 text-sm text-zinc-400">
                  <p>In NeuroQuant, you earn points based on your performance in the Reflex Engine. Higher accuracy and faster velocities yield massive multipliers.</p>
                  {/* Detailed point breakdowns can go here */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Your Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#121214] border border-white/5 rounded-3xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Your Journey
            </h3>
            <span className="text-xs text-zinc-500 font-medium tracking-wide flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Keep going!
            </span>
          </div>

          <div className="space-y-5">
            <JourneyItem 
              icon={<CheckCircle2 className="w-4 h-4 text-purple-400" />}
              text="Welcome to NeuroQuant! You started your journey."
              tag="Getting started"
            />
            {user.diagnosticResults?.length > 0 && (
              <JourneyItem 
                icon={<Target className="w-4 h-4 text-[#00FF9D]" />}
                text="Completed the initial diagnostic test."
              />
            )}
            <JourneyItem 
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              text={`Nice ${user.globalStreak}-day streak! Consistency builds mastery.`}
            />
          </div>

          <div className="mt-8 bg-black/40 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Next Milestone
              </div>
              <div className="text-sm font-bold text-blue-400">Level {currentLevel + 1}</div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 font-medium">
              <span>{user.totalPoints} PTS</span>
              <span>{pointsToNextLevel} to go</span>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#121214] border border-white/5 rounded-3xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              Earned {user.badges?.length || 0}
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Real Badges */}
            {user.badges?.map((b: any) => (
              <BadgeHexagon key={b.id} icon={<Star className="w-6 h-6 text-yellow-900" />} earned />
            ))}
            {/* Placeholders for locked badges to match the Myntbit layout */}
            <BadgeHexagon icon={<Lock className="w-6 h-6 text-zinc-600" />} />
            <BadgeHexagon icon={<Lock className="w-6 h-6 text-zinc-600" />} />
            <BadgeHexagon icon={<Lock className="w-6 h-6 text-zinc-600" />} />
            <BadgeHexagon icon={<Lock className="w-6 h-6 text-zinc-600" />} />
            <BadgeHexagon icon={<Lock className="w-6 h-6 text-zinc-600" />} />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// Subcomponents

function StatCard({ title, value, icon, subtitle, progress, progressText, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-[#121214] border border-white/5 rounded-3xl p-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-zinc-400">{title}</span>
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <h4 className="text-3xl font-black text-white">{value}</h4>
      </div>
      
      {progress !== undefined ? (
        <div className="mt-4">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-white/20 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{progressText}</p>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 font-medium">{subtitle}</p>
      )}
    </motion.div>
  );
}

function JourneyItem({ icon, text, tag }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 relative">
        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 relative">
          {icon}
        </div>
        {/* Connecting line (optional if we had multiple items mapped cleanly) */}
      </div>
      <div>
        <p className="text-sm text-zinc-300">{text}</p>
        {tag && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-white/5 text-zinc-400 border border-white/5">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

function BadgeHexagon({ icon, earned = false }: any) {
  // We can simulate a hexagon using CSS clip-path, or just use a rounded diamond/circle.
  // Myntbit uses hexagons. Let's use clip-path polygon for a hexagon.
  const hexClass = "w-16 h-16 flex items-center justify-center transition-all duration-300";
  const bgClass = earned 
    ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:scale-110" 
    : "bg-zinc-800/50 border border-white/5 opacity-50";

  return (
    <div 
      className={`${hexClass} ${bgClass}`}
      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
    >
      {icon}
    </div>
  );
}
