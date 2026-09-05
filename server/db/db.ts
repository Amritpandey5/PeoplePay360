import mongoose from "mongoose";

export async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connected Successfuly');
    }
    catch(error){
     console.error(`Error in connecting MongoDB...,${error}`);
     process.exit(1);
    }
}