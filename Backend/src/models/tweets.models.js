import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        type:String,
        required:true
    },
    picture:{
        url:{
            type:String,
        },
        picturePublicId:{
            type:String,
        }
    }
},{timestamps:true})

export const tweet = mongoose.model("tweet",tweetSchema);