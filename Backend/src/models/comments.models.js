import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        reuqired:true,
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

export const comment = mongoose.model("comment",commentSchema);