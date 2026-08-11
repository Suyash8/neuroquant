import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { withPerf } from "@/lib/perf";

import { Suspense } from "react";
import SettingsLoading from "./loading";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsData />
    </Suspense>
  );
}

async function SettingsData() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  const dbUser = await withPerf("Prisma: Settings Fetch", () => prisma.user.findUnique({
    where: { id: user.id },
    include: {
      settings: true,
    }
  }));

  if (!dbUser) {
    redirect("/login");
  }

  if (!dbUser.onboarded) {
    redirect("/onboarding");
  }

  const initialSettings = {
    displayName: dbUser.displayName || "",
    email: dbUser.email,
    persona: dbUser.persona,
    commutativity: dbUser.settings?.commutativity ?? true,
    horizon: "60_days", // Hardcoded for bootcamp
    dailyGoal: dbUser.settings?.dailyGoal ?? 50,
    soundEnabled: dbUser.settings?.soundEnabled ?? true,
    hapticEnabled: dbUser.settings?.hapticEnabled ?? true,
    leetcodeUsername: dbUser.settings?.leetcodeUsername || "",
  };

  return <SettingsClient initialSettings={initialSettings} />;
}
