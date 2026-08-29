import { Queue } from "bullmq";
import type { Generation } from "../services/generationService";

export const generationQueue = new Queue("Generations", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

export async function addToQueue(
  generation: Generation
): Promise<void> {
  await generationQueue.add(
    "generate-image",
    {
        generationId: generation.id,
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    }
);
}