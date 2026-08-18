import GameEngine from "@/components/practice/GameEngine";

export default function TheoryPracticePage() {
  return (
    <div className="h-full pt-16 md:pt-0">
      <GameEngine deckSlug="theory" />
    </div>
  );
}
