import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile:{
        url:{
            type:String,
            required:true,
        },
        videoPublicId:{
            type:String,
            required:true,
        }
    },
    thumbnail:{
        url:{
            type:String,
        },
        thumbnailPublicId:{
            type:String,
        }
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:false,
    }
},{timestamps:true});



export const video = mongoose.model("video",videoSchema);