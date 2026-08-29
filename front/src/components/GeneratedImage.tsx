import type { Generation } from "../types/generation";

interface GeneratedImageProps {
  generation: Generation | null;
}

export function GeneratedImage({
  generation,
}: GeneratedImageProps) {
  if (
    !generation ||
    generation.status !== "completed" ||
    !generation.imageUrl
  ) {
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
          {generation.style ?? "None"}
        </p>

        <p>
          <span className="font-semibold">Status:</span>{" "}
          {generation.status}
        </p>

        <p>
          <span className="font-semibold">Created:</span>{" "}
          {new Date(
            generation.createdAt
          ).toLocaleString()}
        </p>
      </div>
    </div>
  );
}