"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";

interface UpdateSettingsPayload {
  commutativity: boolean;
  horizon: string;
  dailyGoal: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
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
);
