import { GenerationForm } from './components/GenerationForm';
import { GeneratedImage } from './components/GeneratedImage';
import { createGeneration,getGenerations} from "./services/generationApi";
import type { ImageStyle, Generation } from './types/generation';
import { useGenerationPolling } from './hooks/userGeneratonPolling';
import { useState} from "react";
import { GenerationHistory } from "./components/GenerationHistory";
import { GenerationStatus } from "./components/GenerationStatus";
import { ErrorMessage } from './components/ErrorMessage';

function App() {




  const [error, setError] = useState<string | null>(null);


  const [generationId, setGenerationId] =
  useState<number | null>(null);



  const [showHistory, setShowHistory] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);


const handleHistory = async () => {
  console.log("history clicked");

  if (showHistory) {
    setShowHistory(false);
    return;
  }

  try {
    console.log("loading history...");

    const data = await getGenerations();

    console.log("history data:", data);

    setGenerations(data);
    setShowHistory(true);
    setError(null);
  } catch (error) {
    console.error("history error:", error);
    setError("Could not load generation history.");
  }
};
 
  const {
  generation,
  error: pollingError,
} = useGenerationPolling(generationId);


 const handleGenerate = async (
  prompt: string,
  style: ImageStyle | null
) => {
  setError(null);

  try {
    const created = await createGeneration(prompt, style);

    setGenerationId(created.id);

    setGenerations((previous) => [
      created,
      ...previous,
    ]);
  } catch (error) {
    console.error(error);
    setError("Image generation could not be started. Please try again.");
  }
};
  return (


      <div className='mx-40 flex flex-col text-center gap-10 border-2'>
        <h1 className=' text-white text-5xl font-extrabold'>AI Image Generator</h1>
        <div>
          <GenerationForm onGenerate={handleGenerate}/>
          <ErrorMessage message={error} />
          {pollingError && (<div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{pollingError}</div>)}
          <GenerationStatus generation={generation} />
          <GeneratedImage generation={generation}/>
          <button onClick={handleHistory}className="rounded-lg bg-slate-700 px-5 py-3 text-white hover:bg-slate-600">{showHistory ? "Hide History" : "History"}</button>
          {showHistory && (<GenerationHistory generations={generations} />)}
        </div>




      </div>
    
  );
}

export default App
