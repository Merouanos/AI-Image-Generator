import type {Generation} from "../services/generationService"
import {Queue} from 'bullmq';


export const generationQueue = new Queue('Generations',{
    connection:{
        host:"redis",
        port:6379,
    },
});


export async function addToQueue(generation: Generation){
   await generationQueue.add('generate-image',{
    generationId: generation.id
});
}


