"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";

interface UpdateSettingsPayload {
  commutativity: boolean;
  horizon: string;
  dailyGoal: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  leetcodeUsername?: string | null;
}

export const updateSettings = withAuthAction<UpdateSettingsPayload, { success: boolean }>(
  async (settings, { user }) => {
    await prisma.$transaction(async (tx) => {
      await tx.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          commutativity: settings.commutativity,
          dailyGoal: settings.dailyGoal,
          soundEnabled: settings.soundEnabled,
          hapticEnabled: settings.hapticEnabled,
          leetcodeUsername: settings.leetcodeUsername,
        },
        update: {
          commutativity: settings.commutativity,
          dailyGoal: settings.dailyGoal,
          soundEnabled: settings.soundEnabled,
          hapticEnabled: settings.hapticEnabled,
          leetcodeUsername: settings.leetcodeUsername,
        }
      });
    });

    return { success: true };
  }
);
