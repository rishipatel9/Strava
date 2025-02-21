import express from "express";
import cors from 'cors';
import { userRouter } from "./routes/user";
const app=express();


app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.send("Hello World");
});

app.use("/user",userRouter)

app.listen(4000,()=>{   
    console.log("Server is running on port 4000");
});

