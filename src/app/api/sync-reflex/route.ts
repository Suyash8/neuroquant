import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/sync-reflex
 * 
 * Fallback endpoint for navigator.sendBeacon when the user closes the tab
 * mid-session. sendBeacon sends a POST with a plain text body (not JSON
 * content-type), so we parse the body manually.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, logs } = body;

    if (!userId || !logs || !Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const profile = await prisma.reflexProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const log of logs) {
        await tx.reflexVelocityLogs.create({
          data: {
            reflexProfileId: profile.id,
            cardId: log.cardId,
            timeMs: log.timeMs,
            quality: log.quality,
          },
        });

        await tx.userReflexProgress.upsert({
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
            nextReview: new Date(Date.now() + log.newInterval * 24 * 60 * 60 * 1000),
          },
          create: {
            reflexProfileId: profile.id,
            cardId: log.cardId,
            ef: log.newEf,
            interval: log.newInterval,
            consecutiveHit: log.newConsecutiveHit,
            nextReview: new Date(Date.now() + log.newInterval * 24 * 60 * 60 * 1000),
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Beacon sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
