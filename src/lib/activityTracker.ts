import { PrismaClient } from "@prisma/client";

export async function logUserActivityAndStreak(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, userId: string, pointsEarned: number = 0) {
  const userDoc = await tx.user.findUnique({ where: { id: userId } });
  if (!userDoc) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Log Activity for Calendar
  await tx.userActivity.upsert({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      userId,
      date: today,
      count: 1
    }
  });

  // 2. Update Streak
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

  await tx.user.update({
    where: { id: userId },
    data: {
      globalStreak: newStreak,
      streakFreezes: newFreezes,
      totalPoints: userDoc.totalPoints + pointsEarned,
      lastSessionDate: new Date()
    }
  });

  return { newStreak, newFreezes };
}
