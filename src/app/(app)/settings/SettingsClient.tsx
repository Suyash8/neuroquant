"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/actions/updateSettings";
import { wipeProgression } from "@/actions/wipeProgression";
import { Settings, Volume2, Smartphone, AlertTriangle, Loader2, CheckCircle2, Zap, X } from "lucide-react";
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
    horizon: initialSettings.horizon,
    dailyGoal: initialSettings.dailyGoal,
    soundEnabled: initialSettings.soundEnabled,
    hapticEnabled: initialSettings.hapticEnabled,
  });

  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleWipe = async () => {
    setIsWiping(true);
    try {
      await wipeProgression();
      setShowWipeModal(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsWiping(false);
    }
  };

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
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Target Horizon</label>
              <div className="relative">
                <select
                  value={form.horizon}
                  onChange={(e) => handleChange("horizon", e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white font-medium focus:outline-none transition-all duration-300 appearance-none focus:border-primary/50 focus:shadow-primary-glow"
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

        {/* Diagnostic Section */}
        <GlassPanel hoverGlow className="p-8">
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
            <Button onClick={() => router.push("/practice/diagnostic?source=settings")}>
              Run Diagnostic
            </Button>
          </div>
        </GlassPanel>

        {/* Danger Zone */}
        <GlassPanel danger interactive className="p-8">
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
            <Button variant="danger" onClick={() => setShowWipeModal(true)}>
              Reset Progress
            </Button>
          </div>
        </GlassPanel>

      </div>

      {/* Wipe Confirmation Modal */}
      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#09090b] border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Nuclear Option</h3>
                    <p className="text-red-400 font-medium text-sm">This cannot be undone.</p>
                  </div>
                </div>
                <button onClick={() => setShowWipeModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-zinc-400 text-sm mb-8 space-y-3">
                <p>Are you absolutely sure you want to wipe all progression data?</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>All neural mappings and flashcards deleted</li>
                  <li>Velocity and accuracy history destroyed</li>
                  <li>Streaks and experience reset to zero</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5" 
                  onClick={() => setShowWipeModal(false)}
                  disabled={isWiping}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  onClick={handleWipe}
                  disabled={isWiping}
                >
                  {isWiping ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Wipe"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
