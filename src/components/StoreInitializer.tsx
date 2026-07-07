"use client";

import { useRef, useEffect } from "react";
import { useGlobalStore } from "@/store/global";

export function StoreInitializer({ user }: { user: any }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useGlobalStore.setState({ user });
    initialized.current = true;
  }
  
  // Re-sync if user changes
  useEffect(() => {
    useGlobalStore.setState({ user });
  }, [user]);

  return null;
}
