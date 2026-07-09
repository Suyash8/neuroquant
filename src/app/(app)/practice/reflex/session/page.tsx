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
    
    // Generate new cards on the fly
    for (let i = 0; i < cardsNeeded; i++) {
      const generated = generateMathQuestion(operationLevel, commutativity);
      
      // Upsert into ReflexCard table to maintain ID constraints for velocity logs
      let cardRecord = await prisma.reflexCard.findFirst({
        where: { question: generated.question }
      });
      
      if (!cardRecord) {
        cardRecord = await prisma.reflexCard.create({
          data: {
            question: generated.question,
            answer: generated.answer,
            category: generated.category,
            difficulty: operationLevel,
          }
        });
      }

      initialQuestions.push({
        id: crypto.randomUUID(), // transient ID for the store
        cardId: cardRecord.id,
        question: cardRecord.question,
        answer: cardRecord.answer,
        ef: 2.5,
        interval: 0,
        consecutiveHit: 0
      });
    }
  }

  return <SessionClient userId={user.id} initialQuestions={initialQuestions} />;
}
