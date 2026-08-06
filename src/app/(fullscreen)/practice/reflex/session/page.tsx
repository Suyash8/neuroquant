import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import SessionClient from "./SessionClient";
import { redirect } from "next/navigation";
import { ReflexQuestion } from "@/store/reflex";
import { generateMathQuestion, OperationLevel } from "@/lib/mathGenerator";
import { withPerf } from "@/lib/perf";
import { Suspense } from "react";
import SessionLoading from "./loading";
import { getUserLevel } from "@/utils/levelCalculator";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<SessionLoading />}>
      <SessionData searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function SessionData({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  const isCustom = searchParams.mode === "custom";

  if (isCustom) {
    // Custom Skirmish generation (purely transient)
    const op = searchParams.op as string || "mixed";
    const tierStr = searchParams.tier as string || "standard";
    const durStr = searchParams.dur as string || "20";
    
    // Map tier to operation level approximations
    let baseLevel = 5;
    if (tierStr === "warmup") baseLevel = 1;
    if (tierStr === "standard") baseLevel = 5;
    if (tierStr === "hard") baseLevel = 8;
    if (tierStr === "insane") baseLevel = 10;
    
    let duration = 20;
    if (durStr === "50") duration = 50;
    if (durStr === "100") duration = 100;
    if (durStr === "endless") duration = 9999;
    
    const initialQuestions: ReflexQuestion[] = [];
    for (let i = 0; i < duration; i++) {
      // Pick operation based on op param
      let currentOp = op;
      if (op === "mixed") {
        const ops = ["addition", "subtraction", "multiplication", "division"];
        currentOp = ops[Math.floor(Math.random() * ops.length)];
      }
      
      let levelToUse = baseLevel;
      if (currentOp === "addition") levelToUse = baseLevel === 1 ? 1 : baseLevel === 5 ? 5 : 8;
      if (currentOp === "subtraction") levelToUse = baseLevel === 1 ? 2 : baseLevel === 5 ? 6 : 9;
      if (currentOp === "multiplication") levelToUse = baseLevel === 1 ? 3 : baseLevel === 5 ? 7 : 10;
      if (currentOp === "division") levelToUse = 4; // Division is currently only lvl 4 in generator
      
      const q = generateMathQuestion(levelToUse as OperationLevel, true);
      initialQuestions.push({
        id: crypto.randomUUID(),
        cardId: "custom-card",
        question: q.question,
        answer: q.answer,
        ef: 2.5,
        interval: 0,
        consecutiveHit: 0
      });
    }
    
    return <SessionClient userId={user.id} initialQuestions={initialQuestions} isCustom={true} />;
  }

  // STANDARD DAILY REVIEW LOGIC
  const [profile, userSettings, rawPendingProgress] = await withPerf("Prisma: Fetch Initial Session Data", () => Promise.all([
    prisma.reflexProfile.findUnique({ where: { userId: user.id } }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
    prisma.userReflexProgress.findMany({
      where: {
        profile: { userId: user.id },
        nextReview: { lte: new Date() }
      },
      include: { card: true },
      take: 150 // maximum possible daily goal
    })
  ]));

  if (!profile) {
    redirect("/practice/reflex");
  }

  const operationLevel = (await getUserLevel(user.id)) as OperationLevel;
  const commutativity = userSettings?.commutativity ?? true;
  const dailyGoal = userSettings?.dailyGoal || 50;

  const pendingProgress = rawPendingProgress.slice(0, dailyGoal);

  let initialQuestions: ReflexQuestion[] = pendingProgress.map(p => ({
    id: p.id,
    cardId: p.cardId,
    question: p.card.question,
    answer: p.card.answer,
    ef: p.ef,
    interval: p.interval,
    consecutiveHit: p.consecutiveHit
  }));

  const SESSION_SIZE = 20;
  if (initialQuestions.length < SESSION_SIZE) {
    const cardsNeeded = SESSION_SIZE - initialQuestions.length;
    
    const generatedQuestions = [];
    for (let i = 0; i < cardsNeeded; i++) {
      generatedQuestions.push(generateMathQuestion(operationLevel, commutativity));
    }
    
    const questionStrings = generatedQuestions.map(q => q.question);

    const existingCards = await withPerf("Prisma: Fetch Existing Cards", () => prisma.reflexCard.findMany({
      where: { question: { in: questionStrings } }
    }));

    const existingQuestionStrings = new Set(existingCards.map(c => c.question));
    
    const missingCards = generatedQuestions.filter(q => !existingQuestionStrings.has(q.question));
    
    let insertedCards: typeof existingCards = [];
    if (missingCards.length > 0) {
      insertedCards = await withPerf("Prisma: Create Missing Cards", () => prisma.reflexCard.createManyAndReturn({
        data: missingCards.map(c => ({
          question: c.question,
          answer: c.answer,
          category: c.category,
          difficulty: operationLevel,
        })),
        skipDuplicates: true
      }));
    }

    const finalCards = [...existingCards, ...insertedCards];

    for (const card of finalCards) {
      if (initialQuestions.find(iq => iq.cardId === card.id)) continue;
      
      initialQuestions.push({
        id: crypto.randomUUID(),
        cardId: card.id,
        question: card.question,
        answer: card.answer,
        ef: 2.5,
        interval: 0,
        consecutiveHit: 0
      });

      if (initialQuestions.length >= SESSION_SIZE) break;
    }
  }

  return <SessionClient userId={user.id} initialQuestions={initialQuestions} isCustom={false} />;
}
