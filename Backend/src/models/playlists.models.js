import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"video"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }  
},{timestamps:true})