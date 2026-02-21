import mongoose,{Schema} from "mongoose";


const sceneSchema=new Schema({
    scene_number:{
        type:Number,
        required:true,
    },
    intensity:{
        type:String,
        required:true,
    },
    background_track:{
        type:String,
    },
    connection_to_previous:{
        type:String,
    },
    episode:{
        type:Schema.Types.ObjectId,
        ref:"Episode",
    },
},{timestamps:true})

export const Scene=mongoose.model("Scene",sceneSchema)