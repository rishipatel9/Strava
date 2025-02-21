import { Router } from "express";

export const postRouter=Router();

postRouter.get("/",(req,res)=>{
    res.json({
        statusCode:200,
        message:"Post Created Successfully"
    });
})