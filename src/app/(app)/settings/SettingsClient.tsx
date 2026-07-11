"use client";

import { useState } from "react";
import { updateSettings, updateProfile } from "@/actions/updateSettings";
import { Save, User, Settings, Volume2, Smartphone, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(initialSettings);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: form.displayName,
        persona: form.persona,
      });

      await updateSettings({
        commutativity: form.commutativity,
        horizon: form.horizon,
        dailyGoal: form.dailyGoal,
        soundEnabled: form.soundEnabled,
        hapticEnabled: form.hapticEnabled,
      });
      
      router.refresh();
      // force reload to apply persona theme correctly globally if changed
      if (form.persona !== initialSettings.persona) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">Configure preferences and engine parameters.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Config"}
        </button>
      </header>

      <div className="space-y-6">
        
        {/* Account Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address (Read-only)</label>
              <input type="text" value={form.email} readOnly className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-400 focus:outline-none cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Display Name</label>
              <input 
                type="text" 
                value={form.displayName} 
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Operator"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Persona Profile</label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleChange("persona", "quant")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    form.persona === "quant" ? "bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  The Quant
                </button>
                <button
                  onClick={() => handleChange("persona", "generalist")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    form.persona === "generalist" ? "bg-[#FF9500]/10 border-[#FF9500] text-[#FF9500]" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  The Generalist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Engine Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Engine Parameters</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Commutativity Training</div>
                <div className="text-sm text-gray-400">Show both 3×7 and 7×3 as separate discrete flashcards.</div>
              </div>
              <button
                onClick={() => handleChange("commutativity", !form.commutativity)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.commutativity ? 'bg-primary' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.commutativity ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Target Horizon</label>
              <select
                value={form.horizon}
                onChange={(e) => handleChange("horizon", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="14_days">14 Days (Aggressive)</option>
                <option value="30_days">30 Days (Standard)</option>
                <option value="3_months">3 Months (Sustainable)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-400">Daily Volume Quota</label>
                <span className="text-sm text-white font-mono">{form.dailyGoal} cards</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5"
                value={form.dailyGoal}
                onChange={(e) => handleChange("dailyGoal", parseInt(e.target.value))}
                className="w-full accent-primary" 
              />
            </div>
          </div>
        </section>

        {/* Interface Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Interface & Sensory</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-white">Audio Feedback</div>
                  <div className="text-sm text-gray-400">Play mechanical ticks on input.</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("soundEnabled", !form.soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.soundEnabled ? 'bg-primary' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-white">Haptic Engine</div>
                  <div className="text-sm text-gray-400">Vibrate device on incorrect answers (Mobile only).</div>
                </div>
              </div>
              <button
                onClick={() => handleChange("hapticEnabled", !form.hapticEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.hapticEnabled ? 'bg-primary' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.hapticEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-panel border-red-500/20 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-red-500/10 pb-4 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Wipe Progression Data</div>
              <div className="text-sm text-gray-400">Permanently delete all neural mappings, streaks, and history.</div>
            </div>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold rounded-lg transition-colors">
              Reset Progress
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
