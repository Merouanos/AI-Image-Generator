import {Worker, Job} from 'bullmq';
import db from "../db/database";
import {Generation,getGenerationById, updateGenerationStatus} from "../services/generationService"
import type {Database} from "better-sqlite3";

const generationWorker= new Worker('Generations', async(job:Job)=>{

    console.log("Processing job:", job.id, job.data);
    const generationId : number = job.data.generationId
    const generation : Generation | null =getGenerationById(db,generationId);
    if (!generation) {
    throw new Error("Generation not found");
    }
    updateGenerationStatus(db, generation.id, "processing");
    await generateImage(db,generation.id);
    console.log("Job complete!!", job.id, job.data);

},
{
    connection:{
        host:"redis",
        port:6379,
    }
});





async function generateImage(db:Database ,generationId:number) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const imageUrl = `https://example.com/generated_images/${generationId}.png`;
        updateGenerationStatus(db, generationId, "completed", imageUrl);
    } catch (error) {
        updateGenerationStatus(db, generationId, "failed", null, error instanceof Error ? error.message : "Unknown error");
    }
};


