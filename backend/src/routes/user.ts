import {  Request, Response, Router } from "express";


export const userRouter=Router();


userRouter.get("/",(req:Request,res:Response)=>{
    res.json({
        statusCode:200,
        message:"User Created Successfully"
    });
})