"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";
import { logUserActivityAndStreak } from "@/lib/activityTracker";

interface SaveSuddenDeathPayload {
  score: number;
  logs: any[];
}

export const saveSuddenDeath = withAuthAction<SaveSuddenDeathPayload, { success: boolean }>(
  async (payload, { user }) => {
    const profile = await prisma.reflexProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) throw new Error("Profile not found");

    await prisma.$transaction(async (tx) => {
      // Save logs
      for (const log of payload.logs) {
        await tx.reflexVelocityLogs.create({
          data: {
            reflexProfileId: profile.id,
            cardId: log.cardId,
            timeMs: log.timeMs,
            quality: log.quality,
            sessionMode: "sudden_death",
          }
        });
      }

      // Update high score
      if (payload.score > profile.suddenDeathHighScore) {
        await tx.reflexProfile.update({
          where: { id: profile.id },
          data: { suddenDeathHighScore: payload.score }
        });
      }

      // Determine points earned (Sudden Death rewards survival)
      const points = payload.score * 2; // e.g., 2 points per correct answer
      await logUserActivityAndStreak(tx as any, user.id, points);
    });

    return { success: true };
  }
);
