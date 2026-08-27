import express from "express";
import "./db/database"; // Ensure the database is initialized


const app = express();
const PORT = 3000;


app.use(express.json());

app.get("/test",(req,res)=>{
    
    
    res.json({status:"ok"});
    console.log("test route called 1 2 3");

});


app.listen(PORT,()=>{

    console.log(`Server running on http://localhost:${PORT}`);

});