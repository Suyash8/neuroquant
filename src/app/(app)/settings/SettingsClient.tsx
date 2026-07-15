"use client";

import { useState, useTransition } from "react";
import { updateSettings, updateProfile } from "@/actions/updateSettings";
import { User, Settings, Volume2, Smartphone, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [form, setForm] = useState(initialSettings);

  const handleChange = (key: string, value: any) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    
    // Auto-save in background
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        await updateProfile({
          displayName: newForm.displayName,
          persona: newForm.persona,
        });

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

        if (key === "persona") {
          window.location.reload();
        }
      } catch (e) {
        console.error(e);
        setSaveStatus("idle");
      }
    });
  };


  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center justify-between h-14">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-zinc-400 mt-1">Configure preferences and engine parameters.</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-2 border border-primary/20">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Account Section */}
        <section className="mynt-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <User className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold text-white">Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Email Address (Read-only)</label>
              <input type="text" value={form.email} readOnly className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-500 focus:outline-none cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Display Name</label>
              <input 
                type="text" 
                value={form.displayName} 
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                onBlur={(e) => {
                  if (e.target.value !== initialSettings.displayName) {
                    handleChange("displayName", e.target.value);
                  }
                }}
                placeholder="Operator"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">Persona Profile</label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleChange("persona", "quant")}
                  className={`flex-1 py-4 px-4 rounded-xl border text-sm font-medium transition-all ${
                    form.persona === "quant" ? "bg-primary/10 border-primary text-primary" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  The Quant
                </button>
                <button
                  onClick={() => handleChange("persona", "generalist")}
                  className={`flex-1 py-4 px-4 rounded-xl border text-sm font-medium transition-all ${
                    form.persona === "generalist" ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  The Generalist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Engine Section */}
        <section className="mynt-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Settings className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold text-white">Engine Parameters</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Commutativity Training</div>
                <div className="text-sm text-zinc-400">Show both 3×7 and 7×3 as separate discrete flashcards.</div>
              </div>
              <button
                onClick={() => handleChange("commutativity", !form.commutativity)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.commutativity ? 'bg-primary' : 'bg-zinc-800'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.commutativity ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Target Horizon</label>
              <select
                value={form.horizon}
                onChange={(e) => handleChange("horizon", e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="14_days">14 Days (Aggressive)</option>
                <option value="30_days">30 Days (Standard)</option>
                <option value="3_months">3 Months (Sustainable)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-400">Daily Volume Quota</label>
                <span className="text-sm text-white font-mono">{form.dailyGoal} cards</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5"
                value={form.dailyGoal}
                onChange={(e) => setForm({ ...form, dailyGoal: parseInt(e.target.value) })}
                onPointerUp={() => handleChange("dailyGoal", form.dailyGoal)}
                className="w-full accent-primary" 
              />
            </div>
          </div>
        </section>

        {/* Interface Section */}
        <section className="mynt-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Smartphone className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold text-white">Interface & Sensory</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-zinc-500" />
                <div>
                  <div className="font-medium text-white">Audio Feedback</div>
                  <div className="text-sm text-zinc-400">Play mechanical ticks on input.</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("soundEnabled", !form.soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.soundEnabled ? 'bg-primary' : 'bg-zinc-800'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-zinc-500" />
                <div>
                  <div className="font-medium text-white">Haptic Engine</div>
                  <div className="text-sm text-zinc-400">Vibrate device on incorrect answers (Mobile only).</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("hapticEnabled", !form.hapticEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.hapticEnabled ? 'bg-primary' : 'bg-zinc-800'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.hapticEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mynt-card border-red-500/20 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-red-500/10 pb-4 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Wipe Progression Data</div>
              <div className="text-sm text-zinc-400">Permanently delete all neural mappings, streaks, and history.</div>
            </div>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold rounded-lg transition-colors border border-red-500/20">
              Reset Progress
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
