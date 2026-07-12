import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import SessionClient from "./SessionClient";
import { redirect } from "next/navigation";
import { ReflexQuestion } from "@/store/reflex";
import { generateMathQuestion, OperationLevel } from "@/lib/mathGenerator";

export default async function SessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.reflexProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    redirect("/practice/reflex");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id }
  });
  const operationLevel = (userSettings?.operationLevel || 1) as OperationLevel;
  const commutativity = userSettings?.commutativity ?? true;
  const dailyGoal = userSettings?.dailyGoal || 50;

  // Fetch pending cards (interval <= now)
  const pendingProgress = await prisma.userReflexProgress.findMany({
    where: {
      reflexProfileId: profile.id,
      nextReview: { lte: new Date() }
    },
    include: { card: true },
    take: dailyGoal // limit to daily goal
  });

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
    const existingCards = await prisma.reflexCard.findMany({
      where: { question: { in: questionStrings } }
    });

    const existingQuestionStrings = new Set(existingCards.map(c => c.question));
    
    // 3. Prepare missing cards for creation
    const missingCards = generatedQuestions.filter(q => !existingQuestionStrings.has(q.question));
    
    // 4. Create missing cards in bulk (skip duplicates just in case)
    if (missingCards.length > 0) {
      await prisma.reflexCard.createMany({
        data: missingCards.map(c => ({
          question: c.question,
          answer: c.answer,
          category: c.category,
          difficulty: operationLevel,
        })),
        skipDuplicates: true
      });
    }

    // 5. Fetch all required cards again to get their IDs
    const finalCards = await prisma.reflexCard.findMany({
      where: { question: { in: questionStrings } }
    });

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
