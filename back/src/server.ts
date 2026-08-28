import express from "express";
import router from "./routes/generations";


const app = express();
const PORT = 3000;


app.use(express.json());
app.use("/api",router);

app.get("/test",(req,res)=>{
    
    
    res.json({status:"ok"});
    console.log("test route called 1 2 3 4");

});


app.listen(PORT,()=>{

    console.log(`Server running on http://localhost:${PORT}`);

});