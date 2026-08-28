import {Generation} from "../services/generationService"
import {processGenerationQueue} from "../workers/generationWorker"
import db from "../db/database"
const generationQueue: Generation[] = [];

export function addToQueue(generation: Generation): void {
    if(generationQueue.length==0){
    generationQueue.push(generation);
    processGenerationQueue(db);
    }
    else
    generationQueue.push(generation);
}

export function getNextGeneration(): Generation | undefined {
    return generationQueue.shift();
}


