"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function saveDiagnosticResult(
  source: string | null,
  persona: string | null,
  horizon: string | null,
  metrics: {
    score: number;
    maxDifficultyReached: number;
    averageVelocityMs: number;
    accuracy: number;
  }
) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("Unauthorized");
  }

  // Save the raw granular result
  await prisma.diagnosticResult.create({
    data: {
      userId: authUser.id,
      score: metrics.score,
      maxDifficultyReached: metrics.maxDifficultyReached,
      averageVelocityMs: metrics.averageVelocityMs,
      accuracy: metrics.accuracy,
      category: "multiplication", // Future proofing
    }
  });

  return { success: true };
}
