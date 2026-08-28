import type { Database } from "better-sqlite3";

export type ImageStyle = "storybook" | "cartoon" | "watercolor";

export type GenerationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface Generation {
  id: number
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
function validateGeneration(prompt: string, style: ImageStyle| null): void {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt cannot be empty");
  }
  if (style && !["storybook", "cartoon", "watercolor"].includes(style)) {
    throw new Error("Invalid style");
  }
}

export function createGeneration(db: Database, prompt: string, style: ImageStyle| null): Generation {
    
    
    validateGeneration(prompt, style);
    
     const result= db.prepare(
        "INSERT INTO generations (prompt, style) VALUES (?, ?)"
    ).run(prompt, style);
    
        
        
    

    const id = Number(result.lastInsertRowid);
    const row = db
    .prepare("SELECT * FROM generations WHERE id = ?")
    .get(id) as GenerationRow;
    if (!row) {
    throw new Error("Generation was created but could not be found");
    }

    return {
    id,
    prompt: row.prompt,
    style: row.style,
    status: row.status,
    imageUrl: row.image_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    };
 




};

