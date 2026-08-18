"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";
import { calculateSM2 } from "@/lib/sm2";

export const getNextCards = withAuthAction(
  async ({ deckSlug, limit = 20 }: { deckSlug: string; limit?: number }, { user }) => {
    const deck = await prisma.deck.findUnique({
      where: { slug: deckSlug }
    });
    if (!deck) throw new Error("Deck not found");

    // We want cards where:
    // 1. User has NO UserCardProgress (new cards)
    // 2. OR UserCardProgress.nextReview <= now (due cards)
    // Prioritize due cards over new cards.

    const now = new Date();
    
    // Get due cards
    const dueProgress = await prisma.userCardProgress.findMany({
      where: {
        userId: user.id,
        card: { deckId: deck.id },
        nextReview: { lte: now }
      },
      include: { card: true },
      take: limit,
      orderBy: { nextReview: 'asc' }
    });

    let result: any[] = dueProgress.map(p => ({
      ...p.card,
      progress: {
        id: p.id,
        ef: p.ef,
        interval: p.interval,
        consecutiveHit: p.consecutiveHit
      }
    }));

    if (result.length < limit) {
      const needed = limit - result.length;
      // Get new cards (no progress entry for this user)
      const newCards = await prisma.card.findMany({
        where: {
          deckId: deck.id,
          progress: {
            none: { userId: user.id }
          }
        },
        take: needed,
        orderBy: { id: 'asc' }
      });

      result = [...result, ...newCards.map(c => ({
        ...c,
        progress: null
      }))];
    }

    return { cards: result, type: deck.type, deckName: deck.name };
  }
);

export const submitCardReview = withAuthAction(
  async (
    { cardId, quality, timeMs, sessionMode }: { cardId: string; quality: number; timeMs: number; sessionMode?: string },
    { user }
  ) => {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new Error("Card not found");

    const progress = await prisma.userCardProgress.findUnique({
      where: {
        userId_cardId: { userId: user.id, cardId }
      }
    });

    const currentInterval = progress?.interval || 0;
    const currentEf = progress?.ef || 2.5;
    const currentConsecutiveHit = progress?.consecutiveHit || 0;

    const { interval, ef, consecutiveHit } = calculateSM2(quality, currentInterval, currentEf, currentConsecutiveHit);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await prisma.$transaction([
      prisma.userCardProgress.upsert({
        where: { userId_cardId: { userId: user.id, cardId } },
        create: {
          userId: user.id,
          cardId,
          ef,
          interval,
          consecutiveHit,
          nextReview
        },
        update: {
          ef,
          interval,
          consecutiveHit,
          nextReview
        }
      }),
      prisma.reviewLog.create({
        data: {
          userId: user.id,
          cardId,
          timeMs,
          quality,
          sessionMode: sessionMode || "review"
        }
      })
    ]);

    return { success: true, nextReview };
  }
);
