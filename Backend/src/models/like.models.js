import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"video"
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tweets"
    }
},{timestamps:true})

export const like = mongoose.model("like",likeSchema);