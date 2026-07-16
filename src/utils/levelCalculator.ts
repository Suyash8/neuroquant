import prisma from "@/lib/prisma";

export async function getUserLevel(userId: string): Promise<number> {
  // Fetch the most recent diagnostic result
  const latestDiagnostic = await prisma.diagnosticResult.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // If no diagnostic is found, default to level 1
  if (!latestDiagnostic) {
    return 1;
  }

  // A very basic initial algorithm to determine operationLevel (1, 2, or 3)
  // This can be expanded later to incorporate ongoing ReflexVelocityLogs
  let calculatedLevel = latestDiagnostic.maxDifficultyReached;

  // Penalize if accuracy was too low (e.g., < 60%)
  if (latestDiagnostic.accuracy < 60 && calculatedLevel > 1) {
    calculatedLevel -= 1;
  }

  // Penalize if velocity is extremely slow despite high accuracy (e.g., > 5 seconds on average)
  if (latestDiagnostic.averageVelocityMs > 5000 && calculatedLevel > 1) {
    calculatedLevel -= 1;
  }

  return calculatedLevel;
}
