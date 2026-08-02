"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";

export const wipeProgression = withAuthAction<void, { success: boolean }>(
  async (_, { user }) => {
    // Delete UserReflexProgress for user's profile
    const profile = await prisma.reflexProfile.findUnique({
      where: { userId: user.id }
    });

    if (profile) {
      await prisma.userReflexProgress.deleteMany({
        where: { profileId: profile.id }
      });
      // Optionally reset level/exp on the profile
      await prisma.reflexProfile.update({
        where: { id: profile.id },
        data: {
          level: 1,
          exp: 0,
        }
      });
    }

    // Delete Diagnostic Results
    await prisma.diagnosticResult.deleteMany({
      where: { userId: user.id }
    });

    // Delete Session Logs
    await prisma.sessionLog.deleteMany({
      where: { userId: user.id }
    });

    return { success: true };
  }
);
