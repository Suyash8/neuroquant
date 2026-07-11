import { Activity, Clock } from "lucide-react";

export default function ProbabilityLabPlaceholder() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
        <Activity className="w-12 h-12 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight">Probability Lab</h1>
      <p className="text-gray-400 max-w-lg text-lg">
        Expected value drills, combinatorics under pressure, and Bayesian updates in real time. Think in probabilities.
      </p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Module under active construction</span>
      </div>
    </div>
  );
}
