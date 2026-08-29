import type { ImageStyle } from "../types/generation";


interface GenerationFormProps{
  onGenerate: (prompt: string, style: ImageStyle | null) => void;
}


function Title(){


    return (<h2 className="text-2xl text-left font-semibold">Describe your image</h2>);
}



function PromptField({ onGenerate }: GenerationFormProps){

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("clicked");
    

    const formData = new FormData(e.currentTarget);

    const prompt = formData.get("prompt") as string;
    const styleValue = formData.get("style") as string;

    const style: ImageStyle | null =
    styleValue === ""
      ? null
      : (styleValue as ImageStyle);

    onGenerate(prompt, style);
    };

    return (


    <form className="p-5 flex gap-2" onSubmit={handleSubmit}>

        <input type="text" name="prompt" autoFocus required className="border bg-white w-full" />

        <div>
        <label htmlFor="style" className="text-xl font-semibold">Choose a style</label>
        <select name="style" defaultValue="" id="style">
            <option value="">No style</option>
            <option value="watercolor">Watercolor</option>
            <option value="storybook">Storybook</option>
            <option value="cartoon">Cartoon</option>
        </select>
        </div>

        <input type="submit"  value="Generate" className=" text-white px-5 py-3 bg-slate-700 rounded-4xl hover:cursor-pointer hover:bg-slate-600" />

    </form>
);



}


export function GenerationForm({onGenerate}: GenerationFormProps){

    return(<div>
        <Title/>
        <PromptField onGenerate={onGenerate}/>
        

    </div>);
};