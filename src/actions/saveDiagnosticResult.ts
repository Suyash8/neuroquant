"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";

interface SaveDiagnosticPayload {
  source: string | null;
  persona: string | null;
  horizon: string | null;
  metrics: {
    score: number;
    maxDifficultyReached: number;
    averageVelocityMs: number;
    accuracy: number;
  };
}

export const saveDiagnosticResult = withAuthAction<SaveDiagnosticPayload, { success: boolean }>(
  async (payload, { user }) => {
    // Save the raw granular result
    await prisma.diagnosticResult.create({
      data: {
        userId: user.id,
        score: payload.metrics.score,
        maxDifficultyReached: payload.metrics.maxDifficultyReached,
        averageVelocityMs: payload.metrics.averageVelocityMs,
        accuracy: payload.metrics.accuracy,
        category: "multiplication", // Future proofing
      }
    });

    return { success: true };
  }
);
