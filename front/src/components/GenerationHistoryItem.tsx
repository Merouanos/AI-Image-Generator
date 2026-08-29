import type { Generation } from "../types/generation";

interface GenerationHistoryItemProps {
  generation: Generation;
}

export function GenerationHistoryItem({
  generation,
}: GenerationHistoryItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      {generation.imageUrl ? (
        <img
          src={generation.imageUrl}
          alt={generation.prompt}
          className="h-24 w-24 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-200">
          No image
        </div>
      )}

      <div className="flex flex-col gap-2 text-left">
        <p className="font-semibold">
          {generation.prompt}
        </p>

        <p className="text-sm text-gray-500">
          Style: {generation.style ?? "None"}
        </p>

        <p className="text-sm">
          Status:{" "}
          <span className="font-semibold">
            {generation.status}
          </span>
        </p>
      </div>
    </div>
  );
}