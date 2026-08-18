import GameEngine from "@/components/practice/GameEngine";

export default function BrainteasersPracticePage() {
  return (
    <div className="h-full pt-16 md:pt-0">
      <GameEngine deckSlug="brainteasers" />
    </div>
  );
}
