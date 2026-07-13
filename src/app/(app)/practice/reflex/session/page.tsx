import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import SessionClient from "./SessionClient";
import { redirect } from "next/navigation";
import { ReflexQuestion } from "@/store/reflex";
import { generateMathQuestion, OperationLevel } from "@/lib/mathGenerator";
import { withPerf } from "@/lib/perf";

export default async function SessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

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

  const operationLevel = (userSettings?.operationLevel || 1) as OperationLevel;
  const commutativity = userSettings?.commutativity ?? true;
  const dailyGoal = userSettings?.dailyGoal || 50;

  // Limit the progress array in memory to the user's custom daily goal
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

  // If we don't have enough pending cards to fill a session (let's say 20 per session block)
  const SESSION_SIZE = 20;
  if (initialQuestions.length < SESSION_SIZE) {
    const cardsNeeded = SESSION_SIZE - initialQuestions.length;
    
    // 1. Generate all new questions in memory
    const generatedQuestions = [];
    for (let i = 0; i < cardsNeeded; i++) {
      generatedQuestions.push(generateMathQuestion(operationLevel, commutativity));
    }
    
    const questionStrings = generatedQuestions.map(q => q.question);

    // 2. Fetch existing cards in bulk
    const existingCards = await withPerf("Prisma: Fetch Existing Cards", () => prisma.reflexCard.findMany({
      where: { question: { in: questionStrings } }
    }));

    const existingQuestionStrings = new Set(existingCards.map(c => c.question));
    
    // 3. Prepare missing cards for creation
    const missingCards = generatedQuestions.filter(q => !existingQuestionStrings.has(q.question));
    
    // 4. Create missing cards in bulk and return them (skip duplicates just in case)
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

    // 5. Combine in memory instead of fetching again
    const finalCards = [...existingCards, ...insertedCards];

    // Populate the queue
    for (const card of finalCards) {
      // Don't add if already in initialQuestions (shouldn't happen since we subtracted cardsNeeded, but just in case)
      if (initialQuestions.find(iq => iq.cardId === card.id)) continue;
      
      initialQuestions.push({
        id: crypto.randomUUID(), // transient ID for the store
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

  return <SessionClient userId={user.id} initialQuestions={initialQuestions} />;
}
