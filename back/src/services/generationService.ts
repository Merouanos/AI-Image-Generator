import type { Database } from "better-sqlite3";
import { addToQueue } from "../queue/generationQueue";

export type ImageStyle = "storybook" | "cartoon" | "watercolor";

export type GenerationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface Generation {
  id: number;
  prompt: string;
  style: ImageStyle | null;
  status: GenerationStatus;
  imageUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface GenerationRow {
  id: number;
  prompt: string;
  style: ImageStyle | null;
  status: GenerationStatus;
  image_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

function validateGeneration(
  prompt: string,
  style: ImageStyle | null
): void {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt cannot be empty");
  }

  if (
    style &&
    !["storybook", "cartoon", "watercolor"].includes(style)
  ) {
    throw new Error("Invalid style");
  }
}

export async function createGeneration(
  db: Database,
  prompt: string,
  style: ImageStyle | null
): Promise<Generation> {
  validateGeneration(prompt, style);

  const result = db
    .prepare(
      "INSERT INTO generations (prompt, style) VALUES (?, ?)"
    )
    .run(prompt, style);

  const id = Number(result.lastInsertRowid);

  const row = db
    .prepare("SELECT * FROM generations WHERE id = ?")
    .get(id) as GenerationRow | undefined;

  if (!row) {
    throw new Error("Generation was created but could not be found");
  }

  const generation: Generation = {
    id: row.id,
    prompt: row.prompt,
    style: row.style,
    status: row.status,
    imageUrl: row.image_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Wait until the job has actually been submitted to BullMQ.
  await addToQueue(generation);

  return generation;
}

export function updateGenerationStatus(
  db: Database,
  id: number,
  status: GenerationStatus,
  imageUrl: string | null = null,
  errorMessage: string | null = null
): void {
  const result = db
    .prepare(
      `UPDATE generations
       SET status = ?,
           image_url = ?,
           error_message = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .run(status, imageUrl, errorMessage, id);

  if (result.changes === 0) {
    throw new Error("Generation doesn't exist");
  }
}

export function getAllGenerations(
  db: Database
): Generation[] {
  const rows = db
    .prepare(
      "SELECT * FROM generations ORDER BY created_at DESC"
    )
    .all() as GenerationRow[];

  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    style: row.style,
    status: row.status,
    imageUrl: row.image_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function getGenerationById(
  db: Database,
  id: number
): Generation | null {
  const row = db
    .prepare("SELECT * FROM generations WHERE id = ?")
    .get(id) as GenerationRow | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    prompt: row.prompt,
    style: row.style,
    status: row.status,
    imageUrl: row.image_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}