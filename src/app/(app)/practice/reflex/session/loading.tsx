"use client";

import { motion } from "framer-motion";

export default function SessionLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0F1115]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-mono text-white font-bold tracking-tight">Initializing Session</h2>
        <p className="text-gray-500 font-mono text-sm mt-2 animate-pulse">Generating neural pathways...</p>
      </motion.div>
    </div>
  );
}
