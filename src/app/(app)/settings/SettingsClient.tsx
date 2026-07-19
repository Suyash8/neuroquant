"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/actions/updateSettings";
import { Settings, Volume2, Smartphone, AlertTriangle, Loader2, CheckCircle2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/global";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [form, setForm] = useState({
    commutativity: initialSettings.commutativity,
    horizon: initialSettings.horizon,
    dailyGoal: initialSettings.dailyGoal,
    soundEnabled: initialSettings.soundEnabled,
    hapticEnabled: initialSettings.hapticEnabled,
  });

  const globalUser = useGlobalStore((state) => state.user);
  const isQuant = globalUser?.persona === "quant";
  
  const activeColor = isQuant ? "bg-[#00FF9D]" : "bg-orange-500";
  const glowColor = isQuant ? "shadow-[0_0_30px_rgba(0,255,157,0.1)]" : "shadow-[0_0_30px_rgba(249,115,22,0.1)]";
  const hoverBorder = isQuant ? "hover:border-[#00FF9D]/30" : "hover:border-orange-500/30";
  const focusBorder = isQuant ? "focus:border-[#00FF9D]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]" : "focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.1)]";
  const textActive = isQuant ? "text-[#00FF9D]" : "text-orange-500";
  const bgActiveMuted = isQuant ? "bg-[#00FF9D]/10" : "bg-orange-500/10";
  const borderActiveMuted = isQuant ? "border-[#00FF9D]/20" : "border-orange-500/20";

  const handleChange = (key: string, value: any) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    
    // Auto-save in background
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        await updateSettings({
          commutativity: newForm.commutativity,
          horizon: newForm.horizon,
          dailyGoal: newForm.dailyGoal,
          soundEnabled: newForm.soundEnabled,
          hapticEnabled: newForm.hapticEnabled,
        });
        
        router.refresh();
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus("idle");
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">System Settings</h1>
          <p className="text-zinc-400 font-medium text-lg">Configure preferences and engine parameters.</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className={`flex items-center gap-2 ${textActive} ${bgActiveMuted} px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-2 border ${borderActiveMuted}`}>
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Engine Section */}
        <section className={`p-8 rounded-[2rem] bg-white/[0.015] border border-white/5 backdrop-blur-2xl transition-all duration-500 ${glowColor} ${hoverBorder}`}>
          <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5 text-zinc-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Engine Parameters</h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white tracking-wide">Commutativity Training</div>
                <div className="text-sm font-medium text-zinc-400 mt-1">Show both 3×7 and 7×3 as separate discrete flashcards.</div>
              </div>
              <button
                onClick={() => handleChange("commutativity", !form.commutativity)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors border border-white/10 shadow-inner ${form.commutativity ? activeColor : 'bg-[#050505]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${form.commutativity ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Target Horizon</label>
              <div className="relative">
                <select
                  value={form.horizon}
                  onChange={(e) => handleChange("horizon", e.target.value)}
                  className={`w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none transition-all duration-300 appearance-none ${focusBorder}`}
                >
                  <option value="14_days">14 Days (Aggressive)</option>
                  <option value="30_days">30 Days (Standard)</option>
                  <option value="3_months">3 Months (Sustainable)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Daily Volume Quota</label>
                <span className={`text-xl font-black ${textActive} tracking-tighter`}>{form.dailyGoal} <span className="text-sm font-bold text-zinc-500">cards</span></span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5"
                value={form.dailyGoal}
                onChange={(e) => setForm({ ...form, dailyGoal: parseInt(e.target.value) })}
                onPointerUp={() => handleChange("dailyGoal", form.dailyGoal)}
                className="w-full h-2 bg-[#050505] rounded-lg appearance-none cursor-pointer border border-white/5"
                style={{
                  accentColor: isQuant ? '#00FF9D' : '#f97316'
                }}
              />
            </div>
          </div>
        </section>

        {/* Interface Section */}
        <section className={`p-8 rounded-[2rem] bg-white/[0.015] border border-white/5 backdrop-blur-2xl transition-all duration-500 ${glowColor} ${hoverBorder}`}>
          <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-zinc-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Interface & Sensory</h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#050505] border border-white/5 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="font-bold text-white tracking-wide">Audio Feedback</div>
                  <div className="text-sm font-medium text-zinc-400 mt-1">Play mechanical ticks on input.</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("soundEnabled", !form.soundEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors border border-white/10 shadow-inner ${form.soundEnabled ? activeColor : 'bg-[#050505]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${form.soundEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#050505] border border-white/5 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="font-bold text-white tracking-wide">Haptic Engine</div>
                  <div className="text-sm font-medium text-zinc-400 mt-1">Vibrate device on incorrect answers (Mobile only).</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("hapticEnabled", !form.hapticEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors border border-white/10 shadow-inner ${form.hapticEnabled ? activeColor : 'bg-[#050505]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${form.hapticEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Diagnostic Section */}
        <section className={`p-8 rounded-[2rem] bg-white/[0.015] border border-white/5 backdrop-blur-2xl transition-all duration-500 ${glowColor} ${hoverBorder}`}>
          <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-zinc-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Diagnostic & Calibration</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="font-bold text-white tracking-wide">Retake Baseline Diagnostic</div>
              <div className="text-sm font-medium text-zinc-400 mt-1">Recalibrate your difficulty tier and update your granular profile.</div>
            </div>
            <button 
              onClick={() => router.push("/practice/diagnostic?source=settings")}
              className={`px-6 py-3 ${bgActiveMuted} ${textActive} font-black uppercase tracking-widest rounded-xl transition-all border ${borderActiveMuted} hover:scale-[1.02] active:scale-95 whitespace-nowrap`}
            >
              Run Diagnostic
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="p-8 rounded-[2rem] bg-red-500/[0.02] border border-red-500/10 backdrop-blur-2xl transition-all duration-500 hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-3 border-b border-red-500/10 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-red-500 tracking-tight">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="font-bold text-white tracking-wide">Wipe Progression Data</div>
              <div className="text-sm font-medium text-zinc-400 mt-1">Permanently delete all neural mappings, streaks, and history.</div>
            </div>
            <button className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20 hover:scale-[1.02] active:scale-95 whitespace-nowrap">
              Reset Progress
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
