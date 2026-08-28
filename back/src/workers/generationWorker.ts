import type {Generation} from "../services/generationService"
import {getNextGeneration} from "../queue/generationQueue";
import {updateGenerationStatus} from "../services/generationService";
import type {Database} from "better-sqlite3";
export async function processGenerationQueue(db:Database) {
    const generation = getNextGeneration();
    if (!generation) {
        return;
    }
    updateGenerationStatus(db,generation.id,"processing");
    await generateImage(db,generation);
    processGenerationQueue(db);  

};

async function generateImage(db:Database ,generation: Generation) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const imageUrl = `https://example.com/generated_images/${generation.id}.png`;
        updateGenerationStatus(db, generation.id, "completed", imageUrl);
    } catch (error) {
        updateGenerationStatus(db, generation.id, "failed", null, error instanceof Error ? error.message : "Unknown error");
    }
};


