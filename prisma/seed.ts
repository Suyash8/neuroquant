const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ReflexCards...');

  // Multiplication 2x2 up to 20x20
  const cards = [];
  for (let i = 2; i <= 20; i++) {
    for (let j = 2; j <= 20; j++) {
      cards.push({
        question: `${i} × ${j}`,
        answer: (i * j).toString(),
        category: 'multiplication',
        difficulty: i > 12 || j > 12 ? 3 : (i > 9 || j > 9 ? 2 : 1),
      });
    }
  }

  // Remove duplicates like 2x3 and 3x2? Let's just put all of them for now.
  const createCards = await prisma.reflexCard.createMany({
    data: cards,
    skipDuplicates: true,
  });

  console.log(`Seeded ${createCards.count} ReflexCards.`);

  console.log('Seeding Badges...');
  const badges = [
    { slug: 'sub-second-club', name: 'Sub-Second Club', description: 'First correct answer under 1.0s', icon: 'Zap', condition: '{"type":"velocity","value":1000,"op":"lt"}' },
    { slug: 'square-master-20x20', name: 'Square Master 20x20', description: 'Complete all squares up to 20x20', icon: 'Brain', condition: '{"type":"category","value":"squares","count":19}' },
    { slug: 'speed-demon', name: 'Speed Demon', description: 'Average velocity under 1.5s across 50+ cards', icon: 'Flame', condition: '{"type":"arv","value":1500,"op":"lt","minCards":50}' },
    { slug: 'iron-streak-7', name: 'Iron Streak 7', description: '7-day streak', icon: 'Trophy', condition: '{"type":"streak","value":7,"op":"gte"}' },
    { slug: 'iron-streak-30', name: 'Iron Streak 30', description: '30-day streak', icon: 'Trophy', condition: '{"type":"streak","value":30,"op":"gte"}' },
    { slug: 'century', name: 'Century', description: '100 cards completed in a single day', icon: 'Activity', condition: '{"type":"daily_count","value":100,"op":"gte"}' },
  ];

  const createBadges = await prisma.badge.createMany({
    data: badges,
    skipDuplicates: true,
  });

  console.log(`Seeded ${createBadges.count} Badges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
