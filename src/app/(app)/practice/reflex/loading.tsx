export default function ReflexLoading() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      <header>
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-white/5 rounded" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center justify-center col-span-1 h-64">
          <div className="w-40 h-40 rounded-full bg-white/5" />
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-6 h-36" />
          <div className="glass-panel p-6 h-36" />
          <div className="glass-panel p-6 h-36 sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}
