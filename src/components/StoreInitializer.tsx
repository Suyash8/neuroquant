"use client";

import { useRef, useEffect } from "react";
import { useGlobalStore } from "@/store/global";

export function StoreInitializer({ user }: { user: any }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useGlobalStore.setState({ user });
    initialized.current = true;
  }
  
  // Re-sync if user changes and update global theme class
  useEffect(() => {
    useGlobalStore.setState({ user });
  }, [user]);

  // Apply theme to document body
  useEffect(() => {
    const persona = user?.persona || "quant";
    const themeClass = `theme-${persona}`;
    
    // Remove all theme classes first
    document.body.classList.remove("theme-quant", "theme-generalist");
    // Add active theme class
    document.body.classList.add(themeClass);
  }, [user?.persona]);

  return null;
}
