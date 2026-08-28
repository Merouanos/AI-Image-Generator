import {Worker, Job} from 'bullmq';
import db from "../db/database";
import {Generation,getGenerationById, updateGenerationStatus} from "../services/generationService"
import {generateImage} from "../services/imageGenerationService"

const generationWorker= new Worker('Generations', async(job:Job)=>{

    try{
    console.log("Processing job:", job.id, job.data);
    const generationId : number = job.data.generationId
    const generation : Generation | null =getGenerationById(db,generationId);
    if (!generation) {
    throw new Error("Generation not found");
    }
    updateGenerationStatus(db, generation.id, "processing");
    await generateImage(db,generation);
    console.log("Job complete!!", job.id, job.data);
    }catch(error){
        console.log(error);
    }

},
{
    connection:{
        host:"redis",
        port:6379,
    }
});







