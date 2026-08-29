import type { ImageStyle, Generation } from "../types/generation";

export async function createGeneration(
  prompt: string,
  style: ImageStyle | null
): Promise<Generation> {
  try {
    const response = await fetch("/api/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        style,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create generation: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Create generation error:", error);

    throw new Error(
      "Unable to start image generation. Please try again."
    );
  }
}

export async function getGeneration(
  id: number
): Promise<Generation> {
  try {
    const response = await fetch(`/api/generations/${id}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch generation: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get generation error:", error);

    throw new Error(
      "Unable to check the generation status."
    );
  }
}

export async function getGenerations(): Promise<Generation[]> {
  try {
    const response = await fetch("/api/generations");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch generations: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get generations error:", error);

    throw new Error(
      "Could not load generation history."
    );
  }
}