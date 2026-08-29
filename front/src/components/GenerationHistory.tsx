import type { Generation } from "../types/generation";
import { GenerationHistoryItem } from "./GenerationHistoryItem";

interface GenerationHistoryProps {
  generations: Generation[];
}

export function GenerationHistory({
  generations,
}: GenerationHistoryProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">
        Generation History
      </h2>

      {generations.length === 0 ? (
        <p>No generations yet.</p>
      ) : (
        generations.map((generation) => (
          <GenerationHistoryItem
            key={generation.id}
            generation={generation}
          />
        ))
      )}
    </div>
  );
}