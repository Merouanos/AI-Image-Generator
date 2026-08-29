export type ImageStyle =
  | "storybook"
  | "cartoon"
  | "watercolor";

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