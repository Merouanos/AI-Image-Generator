import "dotenv/config";
import {Generation,updateGenerationStatus} from "./generationService";
import type{Database} from "better-sqlite3"
import path from "node:path";
import fs from "node:fs/promises";


export async function generateImage(db:Database,generation:Generation){

    const fullPrompt = generation.prompt + ` ,Children's ${generation.style} illustration style.`;
    try{
        const res = await fetch(
            process.env.IMAGE_PROVIDER_URL,{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.IMAGE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: fullPrompt
                }),
            }
        )
          if (!res.ok) {
            throw new Error(`Image API returned ${res.status}`);
        }
        const imageBuffer = Buffer.from(await res.arrayBuffer());
        const imageDir = path.resolve("data/Images");
        await fs.mkdir(imageDir, { recursive: true });
        const imagePath = path.join(
        imageDir,
        `image-${generation.id}.jpg`
        );
        await fs.writeFile(imagePath, imageBuffer);

        console.log(`Saved image to ${imagePath}`);

        updateGenerationStatus(db, generation.id, "completed",imagePath);




    }catch(error){
         updateGenerationStatus(
            db,
            generation.id,
            "failed",
            null,
            error instanceof Error ? error.message : "Unknown error"
        );

        throw new Error("image generation stopped due to "+ error);
    }


};