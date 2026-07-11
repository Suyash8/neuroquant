"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function updateSettings(settings: {
  commutativity: boolean;
  horizon: string;
  dailyGoal: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        commutativity: settings.commutativity,
        dailyGoal: settings.dailyGoal,
        soundEnabled: settings.soundEnabled,
        hapticEnabled: settings.hapticEnabled,
      },
      update: {
        commutativity: settings.commutativity,
        dailyGoal: settings.dailyGoal,
        soundEnabled: settings.soundEnabled,
        hapticEnabled: settings.hapticEnabled,
      }
    });

    await tx.reflexProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        horizon: settings.horizon,
      },
      update: {
        horizon: settings.horizon,
      }
    });
  });

  return { success: true };
}

export async function updateProfile(data: {
  displayName: string;
  persona: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: data.displayName,
      persona: data.persona,
    }
  });

  return { success: true };
}
