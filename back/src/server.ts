import express from "express";


const app = express();
const PORT = 3000;


app.use(express.json());

app.get("/test",(req,res)=>{
    
    
    res.json({status:"ok"});
    console.log("test route called");

});


app.listen(PORT,()=>{

    console.log(`Server running on http://localhost:${PORT}`);

});