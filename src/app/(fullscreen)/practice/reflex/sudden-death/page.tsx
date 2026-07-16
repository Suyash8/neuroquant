import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import SuddenDeathClient from "./SuddenDeathClient";
import { redirect } from "next/navigation";
import { withPerf } from "@/lib/perf";

export default async function SuddenDeathPage() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  // Fetch 100 random cards
  const rawCards = await withPerf("Prisma: Fetch Random Cards", () => prisma.$queryRaw`SELECT * FROM "ReflexCard" ORDER BY RANDOM() LIMIT 100`);

  const initialQuestions = (rawCards as any[]).map((c) => ({
    id: crypto.randomUUID(),
    cardId: c.id,
    question: c.question,
    answer: c.answer,
    ef: 2.5,
    interval: 0,
    consecutiveHit: 0
  }));

  const profile = await withPerf("Prisma: Fetch Sudden Death HighScore", () => prisma.reflexProfile.findUnique({
    where: { userId: user.id },
    select: { suddenDeathHighScore: true }
  }));

  return (
    <SuddenDeathClient 
      userId={user.id} 
      initialQuestions={initialQuestions} 
      highScore={profile?.suddenDeathHighScore || 0}
    />
  );
}
