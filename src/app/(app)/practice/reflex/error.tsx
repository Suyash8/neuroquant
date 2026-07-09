"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ReflexError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Reflex error:", error);
  }, [error]);

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white">Something broke</h2>
      <p className="text-gray-400 max-w-md">
        Hit a wall loading this page. This is probably a temporary database hiccup.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
