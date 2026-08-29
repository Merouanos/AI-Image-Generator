import type { Generation } from "../types/generation";

interface GenerationStatusProps {
  generation: Generation | null;
}

export function GenerationStatus({
  generation,
}: GenerationStatusProps) {
  if (!generation) {
    return null;
  }

  switch (generation.status) {
    case "queued":
      return (
        <div className="text-lg font-semibold">
          Queued...
        </div>
      );

    case "processing":
      return (
        <div className="text-lg font-semibold">
          Generating your image...
        </div>
      );

    case "completed":
      return (
        <div className="text-lg font-semibold">
          Image generated!
        </div>
      );

    case "failed":
    return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
      Image generation failed. Please try again.
    </div>
    );
  }
}