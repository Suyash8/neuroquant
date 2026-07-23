"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, AlertCircle, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { updateProfile } from "@/actions/updateProfile";
import { useGlobalStore } from "@/store/global";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";

export default function AccountClient({ user }: { user: any }) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [persona, setPersona] = useState<"quant" | "generalist">(user.persona || "quant");
  
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const setUser = useGlobalStore((state) => state.setUser);
  const globalUser = useGlobalStore((state) => state.user);

  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

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
      const res = await updateProfile(updatePayload);
      
      if ("error" in res && res.error) {
        setMessage({ type: "error", text: res.error });
        if (field === "username") setUsername(user.username || "");
        if (field === "displayName") setDisplayName(user.displayName || "");
        if (field === "persona") setPersona(user.persona || "quant");
        setSaveStatus("idle");
      } else if (!("error" in res) && res.success && res.user) {
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

  const SaveIndicator = (
    <>
      {saveStatus === "saving" && (
        <span className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
        </span>
      )}
      {saveStatus === "saved" && (
        <span className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in slide-in-from-right-2 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Saved
        </span>
      )}
    </>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Account Settings" 
        description="Manage your identity and core operator profile."
        action={SaveIndicator}
      />

      <GlassPanel className="p-8">
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
            <Input 
              label="Display Name"
              placeholder="e.g. Suyash Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== user.displayName) {
                  handleSave("displayName", e.target.value);
                }
              }}
            />

            <Input 
              label="Username"
              placeholder="operator"
              icon={<span className="font-black">@</span>}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== user.username) {
                  handleSave("username", e.target.value);
                }
              }}
            />
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
      </GlassPanel>
    </PageContainer>
  );
}
