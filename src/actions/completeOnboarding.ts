"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function completeOnboarding(
  persona: string,
  horizon: string,
  diagnosticScore: number // placeholder for initial difficulty mapping if we use it
) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Unauthorized");
  }

  // Transaction to update User, UserSettings, ReflexProfile
  await prisma.$transaction(async (tx) => {
    // 1. Upsert User
    await tx.user.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: authUser.email!,
        persona,
        onboarded: true,
      },
      update: {
        persona,
        onboarded: true,
      },
    });

    // 2. Upsert UserSettings
    await tx.userSettings.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        commutativity: true, // Both 2x3 and 3x2 by default
        dailyGoal: horizon === "14_days" ? 150 : horizon === "30_days" ? 50 : 25,
      },
      update: {
        dailyGoal: horizon === "14_days" ? 150 : horizon === "30_days" ? 50 : 25,
      },
    });

    // 3. Upsert ReflexProfile
    await tx.reflexProfile.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        horizon,
      },
      update: {
        horizon,
      },
    });
  });

  return { success: true };
}
