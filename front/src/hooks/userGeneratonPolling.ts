import { useEffect, useState } from "react";
import { getGeneration } from "../services/generationApi";
import type { Generation } from "../types/generation";

export function useGenerationPolling(
  generationId: number | null
) {
  const [generation, setGeneration] =
    useState<Generation | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (generationId === null) {
      setGeneration(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getGeneration(generationId);

        if (cancelled) return;

        setGeneration(result);
        setError(null);

        if (
          result.status !== "completed" &&
          result.status !== "failed"
        ) {
          setTimeout(poll, 1500);
        }
      } catch (error) {
        console.error(error);

        if (cancelled) return;

        setError(
          "Unable to check the generation status. Retrying..."
        );

        setTimeout(poll, 1500);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [generationId]);

  return {
    generation,
    error,
  };
}