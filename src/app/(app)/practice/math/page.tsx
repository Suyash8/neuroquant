import GameEngine from "@/components/practice/GameEngine";
import { getNextCards } from "@/actions/cards";

export default async function MathPracticePage() {
  const result = await getNextCards({ deckSlug: "math", limit: 15 });
  
  // If there's an error (e.g. not authenticated or deck not found), 
  // we just pass undefined, GameEngine will fallback to client-side loading or handle error.
  const initialData = "error" in result ? undefined : result;

  return (
    <div className="h-full pt-16 md:pt-0">
      <GameEngine deckSlug="math" initialData={initialData} />
    </div>
  );
}
