import { AlertTriangle, Save, Settings, Smartphone, User } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24 animate-pulse">
      <header className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-white/5 rounded-lg"></div>
        </div>
        <div className="w-32 h-10 bg-white/10 rounded-lg"></div>
      </header>

      <div className="space-y-6">
        
        {/* Account Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <User className="w-5 h-5 text-gray-400/50" />
            <div className="h-6 w-24 bg-white/10 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-11 w-full bg-white/5 rounded-lg"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-11 w-full bg-white/5 rounded-lg"></div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="flex gap-4">
                <div className="flex-1 h-12 bg-white/5 rounded-xl"></div>
                <div className="flex-1 h-12 bg-white/5 rounded-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Engine Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Settings className="w-5 h-5 text-gray-400/50" />
            <div className="h-6 w-40 bg-white/10 rounded"></div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-48 bg-white/10 rounded mb-1"></div>
                <div className="h-4 w-64 bg-white/5 rounded"></div>
              </div>
              <div className="h-6 w-11 bg-white/10 rounded-full"></div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-11 w-full bg-white/5 rounded-lg"></div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-white/10 rounded"></div>
                <div className="h-4 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Interface Section */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <Smartphone className="w-5 h-5 text-gray-400/50" />
            <div className="h-6 w-40 bg-white/10 rounded"></div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/5 rounded"></div>
                <div>
                  <div className="h-5 w-32 bg-white/10 rounded mb-1"></div>
                  <div className="h-4 w-48 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-11 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
