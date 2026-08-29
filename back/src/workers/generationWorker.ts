import { Worker, type Job } from "bullmq";
import db from "../db/database";
import {
  getGenerationById,
  updateGenerationStatus,
} from "../services/generationService";
import { generateImage } from "../services/imageGenerationService";

const MAX_ATTEMPTS = 3;

const generationWorker = new Worker(
  "Generations",
  async (job: Job) => {
    console.log(
      `Processing job: ${job.id}`,
      job.data,
      `attempt ${job.attemptsMade + 1}/${MAX_ATTEMPTS}`
    );

    const generationId = job.data.generationId as number;

    const generation = getGenerationById(db, generationId);

    if (!generation) {
      throw new Error("Generation not found");
    }

    updateGenerationStatus(
      db,
      generation.id,
      "processing"
    );

    try {
      await generateImage(db, generation);

      console.log(`Job ${job.id} completed`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown image generation error";

      const isFinalAttempt =
        job.attemptsMade + 1 >= MAX_ATTEMPTS;

      console.log(
        `Job ${job.id} failed: ${message}`
      );

      if (isFinalAttempt) {
        console.log(
          `Job ${job.id} exhausted all retries. Marking generation as failed.`
        );

        updateGenerationStatus(
          db,
          generation.id,
          "failed",
          null,
          message
        );
      }

      throw error;
    }
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
  }
);

