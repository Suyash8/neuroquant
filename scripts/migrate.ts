import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration...");

  // 1. Fetch old ReflexCards
  const oldCards = await prisma.reflexCard.findMany({
    include: { progress: true },
  });
  console.log(`Found ${oldCards.length} ReflexCards`);

  if (oldCards.length === 0) {
    console.log("No cards to migrate. Exiting.");
    return;
  }

  // 2. Ensure Math deck exists
  let mathDeck = await prisma.deck.findUnique({ where: { slug: "math-reflex" } });
  if (!mathDeck) {
    mathDeck = await prisma.deck.create({
      data: {
        slug: "math-reflex",
        name: "Quant Math Reflex",
        type: "math",
      },
    });
    console.log("Created Math Deck.");
  }

  // 3. Migrate Cards
  for (const oldCard of oldCards) {
    const newCard = await prisma.card.create({
      data: {
        deckId: mathDeck.id,
        front: oldCard.question,
        back: oldCard.answer,
        category: oldCard.category,
        difficulty: oldCard.difficulty,
      },
    });

    // 4. Migrate Progress
    if (oldCard.progress.length > 0) {
      for (const prog of oldCard.progress) {
        // Find user id via reflex profile
        const profile = await prisma.reflexProfile.findUnique({
          where: { id: prog.reflexProfileId },
        });

        if (profile) {
          // Check if UserCardProgress already exists
          const exists = await prisma.userCardProgress.findUnique({
            where: {
              userId_cardId: {
                userId: profile.userId,
                cardId: newCard.id,
              },
            },
          });

          if (!exists) {
            await prisma.userCardProgress.create({
              data: {
                userId: profile.userId,
                cardId: newCard.id,
                ef: prog.ef,
                interval: prog.interval,
                consecutiveHit: prog.consecutiveHit,
                nextReview: prog.nextReview,
              },
            });
          }
        }
      }
    }
  }

  // 5. Migrate Logs (optional, if needed. Assuming we don't migrate logs right now as it's not strictly necessary for progression tracking)

  console.log("Migration complete!");
}

migrate()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
