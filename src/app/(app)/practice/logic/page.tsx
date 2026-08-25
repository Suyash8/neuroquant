import GameEngine from "@/components/practice/GameEngine";
import { getNextCards } from "@/actions/cards";

export default async function LogicPracticePage() {
  const result = await getNextCards({ deckSlug: "logic", limit: 15 });
  const initialData = "error" in result ? undefined : result;

  return (
    <div className="h-full pt-16 md:pt-0">
      <GameEngine deckSlug="logic" initialData={initialData} />
    </div>
  );
}
