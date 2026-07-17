"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { logUserActivityAndStreak } from "@/lib/activityTracker";

export async function saveSuddenDeath(score: number, logs: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.reflexProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) throw new Error("Profile not found");

  await prisma.$transaction(async (tx) => {
    // Save logs
    for (const log of logs) {
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
    if (score > profile.suddenDeathHighScore) {
      await tx.reflexProfile.update({
        where: { id: profile.id },
        data: { suddenDeathHighScore: score }
      });
    }

    // Determine points earned (Sudden Death rewards survival)
    const points = score * 2; // e.g., 2 points per correct answer
    await logUserActivityAndStreak(tx as any, user.id, points);
  });

  return { success: true };
}
