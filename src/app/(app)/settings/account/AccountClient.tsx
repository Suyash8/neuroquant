"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, AlertCircle, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { updateProfile } from "@/actions/updateProfile";
import { useGlobalStore } from "@/store/global";

export default function AccountClient({ user }: { user: any }) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [persona, setPersona] = useState<"quant" | "generalist">(user.persona || "quant");
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const setUser = useGlobalStore((state) => state.setUser);
  const globalUser = useGlobalStore((state) => state.user);

  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const isQuant = persona === "quant";
  const glowColor = isQuant ? "shadow-[0_0_30px_rgba(0,255,157,0.15)]" : "shadow-[0_0_30px_rgba(249,115,22,0.15)]";
  const focusBorder = isQuant ? "focus:border-[#00FF9D]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]" : "focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.1)]";

  const handleSave = (field: "displayName" | "username" | "persona", value: string) => {
    setSaveStatus("saving");
    setMessage(null);

    const updatePayload = {
      displayName,
      username,
      persona,
      [field]: value
    };

    startTransition(async () => {
      const res = await updateProfile(updatePayload as any);

      if (res.error) {
        setMessage({ type: "error", text: res.error });
        setSaveStatus("idle");
      } else if (res.success && res.user) {
        // Update global state
        if (globalUser) {
          setUser({
            ...globalUser,
            username: res.user.username,
            displayName: res.user.displayName,
            persona: res.user.persona as any
          });
        }
        
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-zinc-400 font-medium text-lg">Manage your identity and core operator profile.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-2 text-[#00FF9D] bg-[#00FF9D]/10 px-3 py-1.5 rounded-full border border-[#00FF9D]/20 animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className={`p-8 rounded-[2rem] bg-white/[0.015] border border-white/5 backdrop-blur-2xl transition-all duration-500 ${glowColor}`}>
        
        <div className="space-y-8">
          
          {/* Read-only Email */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4" /> Registered Email
            </label>
            <div className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-zinc-500 font-medium flex items-center justify-between cursor-not-allowed">
              {user.email}
              <Shield className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-600 font-medium">Email changes are currently disabled for security.</p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Display Name
              </label>
              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value !== user.displayName) {
                    handleSave("displayName", e.target.value);
                  }
                }}
                placeholder="e.g. Suyash Sharma"
                className={`w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-medium placeholder:text-zinc-700 outline-none transition-all duration-300 ${focusBorder}`}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black select-none">
                  @
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value !== user.username) {
                      handleSave("username", e.target.value);
                    }
                  }}
                  placeholder="operator"
                  className={`w-full bg-[#050505] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-medium placeholder:text-zinc-700 outline-none transition-all duration-300 ${focusBorder}`}
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

          {/* Persona Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Operator Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button 
                onClick={() => {
                  setPersona("quant");
                  handleSave("persona", "quant");
                }}
                className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden text-left ${
                  persona === "quant" 
                    ? "bg-[#00FF9D]/10 border-[#00FF9D]/50 shadow-[0_0_20px_rgba(0,255,157,0.15)]" 
                    : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
              >
                {persona === "quant" && <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF9D]/20 blur-[30px] pointer-events-none" />}
                <div className="relative z-10 flex items-center justify-between mb-2">
                  <span className={`text-lg font-black tracking-tight ${persona === "quant" ? "text-[#00FF9D]" : "text-white"}`}>
                    Quant Developer
                  </span>
                  {persona === "quant" && <CheckCircle2 className="w-5 h-5 text-[#00FF9D]" />}
                </div>
                <p className="relative z-10 text-xs font-medium text-zinc-400">
                  Neon green aesthetics. For high-frequency traders and algorithm architects.
                </p>
              </button>

              <button 
                onClick={() => {
                  setPersona("generalist");
                  handleSave("persona", "generalist");
                }}
                className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden text-left ${
                  persona === "generalist" 
                    ? "bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
                    : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
              >
                {persona === "generalist" && <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 blur-[30px] pointer-events-none" />}
                <div className="relative z-10 flex items-center justify-between mb-2">
                  <span className={`text-lg font-black tracking-tight ${persona === "generalist" ? "text-orange-500" : "text-white"}`}>
                    Generalist
                  </span>
                  {persona === "generalist" && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>
                <p className="relative z-10 text-xs font-medium text-zinc-400">
                  Neon orange aesthetics. For adaptable problem solvers and strategists.
                </p>
              </button>

            </div>
          </div>

          <div className="pt-2">
            <AnimatePresence mode="wait">
              {message && message.type === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
