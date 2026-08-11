"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/actions/updateSettings";
import { Settings, Volume2, Smartphone, AlertTriangle, Loader2, CheckCircle2, Zap, X, Code } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [form, setForm] = useState({
    commutativity: initialSettings.commutativity,
    dailyGoal: initialSettings.dailyGoal,
    soundEnabled: initialSettings.soundEnabled,
    hapticEnabled: initialSettings.hapticEnabled,
    leetcodeUsername: initialSettings.leetcodeUsername,
  });

  const handleChange = (key: string, value: any) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    
    // Auto-save in background
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        await updateSettings({
          commutativity: newForm.commutativity,
          horizon: "60_days", // unused but required by legacy if not stripped completely
          dailyGoal: newForm.dailyGoal,
          soundEnabled: newForm.soundEnabled,
          hapticEnabled: newForm.hapticEnabled,
          leetcodeUsername: newForm.leetcodeUsername,
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

  const SaveIndicator = (
    <>
      {saveStatus === "saving" && (
        <span className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
        </span>
      )}
      {saveStatus === "saved" && (
        <span className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-2 border border-primary/20 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Saved
        </span>
      )}
    </>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="System Settings" 
        description="Configure preferences and engine parameters."
        action={SaveIndicator}
      />

      <div className="space-y-6">
        
        {/* Engine Section */}
        <GlassPanel hoverGlow className="p-8">
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
              <Toggle checked={form.commutativity} onChange={(v) => handleChange("commutativity", v)} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">LeetCode Username</label>
              <input
                type="text"
                placeholder="Enter LeetCode username for tracking"
                value={form.leetcodeUsername}
                onChange={(e) => handleChange("leetcodeUsername", e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-primary-glow"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Daily Volume Quota</label>
                <span className="text-xl font-black text-primary tracking-tighter">{form.dailyGoal} <span className="text-sm font-bold text-zinc-500">cards</span></span>
              </div>
              <Slider 
                min={10} max={200} step={5}
                value={form.dailyGoal}
                onChangeValue={(v) => setForm({ ...form, dailyGoal: v })}
                onCommit={(v) => handleChange("dailyGoal", v)}
              />
            </div>
          </div>
        </GlassPanel>

        {/* Interface Section */}
        <GlassPanel hoverGlow className="p-8">
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
              <Toggle checked={form.soundEnabled} onChange={(v) => handleChange("soundEnabled", v)} />
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
              <Toggle checked={form.hapticEnabled} onChange={(v) => handleChange("hapticEnabled", v)} />
            </div>
          </div>
        </GlassPanel>

      </div>

    </PageContainer>
  );
}
