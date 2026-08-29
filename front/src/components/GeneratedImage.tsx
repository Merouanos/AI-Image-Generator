import type { Generation } from "../types/generation";

interface GeneratedImageProps {
  generation: Generation | null;
}

export function GeneratedImage({
  generation,
}: GeneratedImageProps) {
  if (!generation) {
    return null;
  }

  if (generation.status === "failed") {
  return (
    <div className="rounded-xl border p-5 text-red-600">
      <p className="font-semibold">
        Generation failed
      </p>

      <p>
        Image generation failed. Please try again.
      </p>
    </div>
  );
}

  if (generation.status !== "completed" || !generation.imageUrl) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5">
      <img
        src={generation.imageUrl}
        alt={generation.prompt}
        className="mx-auto max-h-[600px] max-w-full rounded-xl object-contain"
      />

      <div className="text-left">
        <p>
          <span className="font-semibold">Prompt:</span>{" "}
          {generation.prompt}
        </p>

        <p>
          <span className="font-semibold">Style:</span>{" "}
          {generation.style??"None"}
        </p>

        <p>
          <span className="font-semibold">Status:</span>{" "}
          {generation.status}
        </p>

        <p>
          <span className="font-semibold">Created:</span>{" "}
          {new Date(generation.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}