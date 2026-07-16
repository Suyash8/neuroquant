"use server";

import prisma from "@/lib/prisma";

interface SyncPayload {
  userId: string;
  logs: {
    cardId: string;
    timeMs: number;
    quality: number;
    newEf: number;
    newInterval: number;
    newConsecutiveHit: number;
  }[];
}

export async function syncReflexSession(payload: SyncPayload) {
  try {
    const { userId, logs } = payload;

    // We first need the ReflexProfile ID for this user
    const profile = await prisma.reflexProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Reflex profile not found for user.");
    }
    
    let totalPointsEarned = 0;
    logs.forEach(log => {
      if (log.quality === 5) totalPointsEarned += 10;
      else if (log.quality === 4) totalPointsEarned += 7;
      else if (log.quality === 3) totalPointsEarned += 5;
      else if (log.quality === 1) totalPointsEarned += 1;
    });

    // Run all database updates in a single pipelined transaction to eliminate latency
    await prisma.$transaction(async (tx) => {
      // 1. Bulk insert velocity logs
      await tx.reflexVelocityLogs.createMany({
        data: logs.map(log => ({
          reflexProfileId: profile.id,
          cardId: log.cardId,
          timeMs: log.timeMs,
          quality: log.quality,
        }))
      });

      // 2. Parallelize Upserts for SM-2 Progress within the same transaction
      await Promise.all(logs.map(log => 
        tx.userReflexProgress.upsert({
          where: {
            reflexProfileId_cardId: {
              reflexProfileId: profile.id,
              cardId: log.cardId,
            },
          },
          update: {
            ef: log.newEf,
            interval: log.newInterval,
            consecutiveHit: log.newConsecutiveHit,
            nextReview: new Date(Date.now() + log.newInterval * 60 * 1000),
          },
          create: {
            reflexProfileId: profile.id,
            cardId: log.cardId,
            ef: log.newEf,
            interval: log.newInterval,
            consecutiveHit: log.newConsecutiveHit,
            nextReview: new Date(Date.now() + log.newInterval * 60 * 1000),
          },
        })
      ));
      
      // 3. Streak & ARV & Level Progression logic
      const userDoc = await tx.user.findUnique({ where: { id: userId }, include: { settings: true } });
      if (userDoc) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastSessionDate = userDoc.lastSessionDate ? new Date(userDoc.lastSessionDate) : null;
        if (lastSessionDate) lastSessionDate.setHours(0, 0, 0, 0);
        
        let newStreak = userDoc.globalStreak;
        let newFreezes = userDoc.streakFreezes;
        
        if (!lastSessionDate) {
          newStreak = 1;
        } else {
          const diffDays = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            if (newFreezes > 0) {
              newFreezes -= 1;
              newStreak += 1; // Used a freeze
            } else {
              newStreak = 1; // Streak broken
            }
          }
        }
        
        // Simple ARV moving average approximation
        const sessionArv = logs.reduce((acc, l) => acc + l.timeMs, 0) / logs.length;
        const newArv = userDoc.averageVelocityMs === 0 
          ? sessionArv 
          : (userDoc.averageVelocityMs * 0.9) + (sessionArv * 0.1);

        await tx.user.update({
          where: { id: userId },
          data: {
            globalStreak: newStreak,
            streakFreezes: newFreezes,
            totalPoints: userDoc.totalPoints + totalPointsEarned,
            lastSessionDate: new Date(),
            averageVelocityMs: newArv
          }
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to sync Reflex session:", error);
    return { success: false, error: "Sync failed" };
  }
}
