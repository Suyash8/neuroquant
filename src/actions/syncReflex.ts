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

    // We don't use a strict transaction for the card logs to avoid timeouts
    // Instead we process them in parallel.
    await Promise.all(logs.map(async (log) => {
      // 1. Insert Velocity Log
      await prisma.reflexVelocityLogs.create({
        data: {
          reflexProfileId: profile.id,
          cardId: log.cardId,
          timeMs: log.timeMs,
          quality: log.quality,
        },
      });

      // 2. Upsert User Progress (SM-2 parameters)
      await prisma.userReflexProgress.upsert({
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
          nextReview: new Date(Date.now() + log.newInterval * 60 * 1000), // Add minutes
        },
        create: {
          reflexProfileId: profile.id,
          cardId: log.cardId,
          ef: log.newEf,
          interval: log.newInterval,
          consecutiveHit: log.newConsecutiveHit,
          nextReview: new Date(Date.now() + log.newInterval * 60 * 1000),
        },
      });
      
      // Calculate points based on quality
      if (log.quality === 5) totalPointsEarned += 10;
      else if (log.quality === 4) totalPointsEarned += 7;
      else if (log.quality === 3) totalPointsEarned += 5;
      else if (log.quality === 1) totalPointsEarned += 1;
    }));
      
    // 3. Streak & ARV & Level Progression logic (Single isolated transaction)
    await prisma.$transaction(async (tx) => {
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

        // Progression check
        let newLevel = userDoc.settings?.operationLevel || 1;
        // If they average under 1.5 seconds and had a good streak, we can auto-level them
        if (newArv > 0 && newArv < 1500 && newLevel < 10) {
           // We'll require at least 50 points total to prevent instant jumping
           if (userDoc.totalPoints + totalPointsEarned > newLevel * 100) {
              newLevel += 1;
           }
        }

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
        
        if (userDoc.settings && userDoc.settings.operationLevel !== newLevel) {
          await tx.userSettings.update({
            where: { userId },
            data: { operationLevel: newLevel }
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to sync Reflex session:", error);
    return { success: false, error: "Sync failed" };
  }
}
