import type { ImageStyle } from "../types/generation";






export async function createGeneration(prompt:string , style:ImageStyle|null){

    console.log('generate');
    let res;
    if(style){
    res = await fetch(`/api/generations`,{
        method:"POST",
        headers: {
        "Content-Type": "application/json",
        },
        
        body: JSON.stringify({ prompt, style }),



         });
        }
    else{
      res = await fetch(`/api/generations`,{
        method:"POST",
        headers: {
        "Content-Type": "application/json",
        },
        
        body: JSON.stringify({ prompt }),



         });

    }


    if (!res.ok) {
    throw new Error("Failed to create generation");
    }
    return res.json();


};

export async function getGeneration(id: number) {
  const response = await fetch(`/api/generations/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch generation");
  }

  return response.json();
}


export async function getGenerations() {
  const response = await fetch(`/api/generations`);

  if (!response.ok) {
    throw new Error("Failed to fetch generations");
  }

  return response.json();
}