import { Worker, type Job } from "bullmq";
import db from "../db/database";
import {
  getGenerationById,
  updateGenerationStatus,
} from "../services/generationService";
import { generateImage } from "../services/imageGenerationService";

const generationWorker = new Worker(
  "Generations",
  async (job: Job) => {
    console.log("Processing job:", job.id, job.data);

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

    await generateImage(db, generation);

    console.log("Job complete:", job.id);
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
  }
);

generationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

generationWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});