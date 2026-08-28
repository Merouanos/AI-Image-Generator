import "dotenv/config";

import type { Database } from "better-sqlite3";
import type { Generation } from "./generationService";
import { updateGenerationStatus } from "./generationService";

import fs from "node:fs/promises";
import path from "node:path";

export async function generateImage(
  db: Database,
  generation: Generation
): Promise<void> {
  if (!process.env.IMAGE_PROVIDER_URL) {
    throw new Error("IMAGE_PROVIDER_URL is not configured");
  }

  if (!process.env.IMAGE_API_KEY) {
    throw new Error("IMAGE_API_KEY is not configured");
  }

  const fullPrompt = generation.style
    ? `${generation.prompt}, children's ${generation.style} illustration style.`
    : generation.prompt;

  try {
    const response = await fetch(
      process.env.IMAGE_PROVIDER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.IMAGE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Image API returned ${response.status}`
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/")) {
      throw new Error(
        `Image API returned unexpected content type: ${contentType}`
      );
    }

    const imageBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    const imageDirectory = path.resolve(
      "data/Images"
    );

    await fs.mkdir(imageDirectory, {
      recursive: true,
    });

    const imagePath = path.join(
      imageDirectory,
      `image-${generation.id}.jpg`
    );

    await fs.writeFile(imagePath, imageBuffer);

   
    const imageUrl =
      `/images/image-${generation.id}.jpg`;

    updateGenerationStatus(
      db,
      generation.id,
      "completed",
      imageUrl,
      null
    );

    console.log(`Saved image to ${imagePath}`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown image generation error";

    updateGenerationStatus(
      db,
      generation.id,
      "failed",
      null,
      message
    );

    throw error;
  }
}