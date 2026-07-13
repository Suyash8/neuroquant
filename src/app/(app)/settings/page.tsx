import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import { withPerf } from "@/lib/perf";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) return null;

  const dbUser = await withPerf("Prisma: Settings Fetch", () => prisma.user.findUnique({
    where: { id: user.id },
    include: {
      settings: true,
      reflexProfile: true,
    }
  }));

  if (!dbUser) return null;

  const initialSettings = {
    displayName: dbUser.displayName || "",
    email: dbUser.email,
    persona: dbUser.persona,
    commutativity: dbUser.settings?.commutativity ?? true,
    horizon: dbUser.reflexProfile?.horizon || "30_days",
    dailyGoal: dbUser.settings?.dailyGoal ?? 50,
    soundEnabled: dbUser.settings?.soundEnabled ?? true,
    hapticEnabled: dbUser.settings?.hapticEnabled ?? true,
  };

  return <SettingsClient initialSettings={initialSettings} />;
}
