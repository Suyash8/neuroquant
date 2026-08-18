import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Decks and Cards...');

  // 1. Math Deck
  const mathDeck = await prisma.deck.upsert({
    where: { slug: 'math' },
    update: {},
    create: {
      slug: 'math',
      name: 'Reflex Math',
      type: 'math',
    }
  });

  // Math Cards
  const mathCards = [
    { front: '12 * 14', back: '168' },
    { front: '15 * 15', back: '225' },
    { front: '1/8 = ?%', back: '12.5' },
    { front: '3/16 = ?%', back: '18.75' },
    { front: '2^10', back: '1024' },
    { front: '13 * 13', back: '169' },
    { front: '14 * 14', back: '196' },
  ];

  for (const c of mathCards) {
    const exists = await prisma.card.findFirst({ where: { deckId: mathDeck.id, front: c.front } });
    if (!exists) {
      await prisma.card.create({
        data: {
          deckId: mathDeck.id,
          front: c.front,
          back: c.back,
          difficulty: 1,
        }
      });
    }
  }

  // 2. Theory Deck
  const theoryDeck = await prisma.deck.upsert({
    where: { slug: 'theory' },
    update: {},
    create: {
      slug: 'theory',
      name: 'C++ Systems Theory',
      type: 'theory',
    }
  });

  const theoryCards = [
    { front: 'What is the difference between a pointer and a reference in C++?', back: 'A pointer is a variable that holds a memory address and can be reassigned or be null. A reference is an alias for an existing variable, cannot be null, and cannot be reseated after initialization.' },
    { front: 'What is std::move and what does it actually do?', back: 'std::move is a static cast to an rvalue reference (T&&). It doesn\'t actually move anything by itself; it just enables move semantics by signaling that the object can be safely "stolen" from.' },
    { front: 'Explain RAII.', back: 'Resource Acquisition Is Initialization. It ties the lifecycle of a resource (memory, locks, files) to the lifetime of an object. The constructor acquires the resource, and the destructor automatically releases it when the object goes out of scope.' },
  ];

  for (const c of theoryCards) {
    const exists = await prisma.card.findFirst({ where: { deckId: theoryDeck.id, front: c.front } });
    if (!exists) {
      await prisma.card.create({
        data: {
          deckId: theoryDeck.id,
          front: c.front,
          back: c.back,
          difficulty: 2,
        }
      });
    }
  }

  // 3. Brainteasers Deck
  const brainteasersDeck = await prisma.deck.upsert({
    where: { slug: 'brainteasers' },
    update: {},
    create: {
      slug: 'brainteasers',
      name: 'Quant Brainteasers',
      type: 'brainteaser',
    }
  });

  const brainteaserCards = [
    { front: 'You have two ropes. Each takes exactly 60 minutes to burn, but they burn at inconsistent rates. How do you measure exactly 45 minutes?', back: 'Light the first rope at both ends, and the second rope at one end. The first rope will burn out in exactly 30 minutes. At that exact moment, light the other end of the second rope. It will burn out 15 minutes later. 30 + 15 = 45 minutes.' },
    { front: 'A lily pad doubles in size every day. In 30 days it covers the whole pond. On what day does it cover half the pond?', back: 'Day 29. If it doubles every day, it was half the size the day before it covered the entire pond.' },
  ];

  for (const c of brainteaserCards) {
    const exists = await prisma.card.findFirst({ where: { deckId: brainteasersDeck.id, front: c.front } });
    if (!exists) {
      await prisma.card.create({
        data: {
          deckId: brainteasersDeck.id,
          front: c.front,
          back: c.back,
          difficulty: 3,
        }
      });
    }
  }

  console.log('Done seeding!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
