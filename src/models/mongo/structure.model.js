import mongoose, { Schema} from "mongoose";

const structureSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    acts:[{
        act_number:Number,
        title:String,
        summary:String,
        key_events:[String]
    }],
    episodes:[{
        episode_number:Number,
        title:String,
        summary:String,
    }],
    characters:[{
        name:String,
        role:String,
        arc:String,
    }],
    ideaSession:{
        type: Schema.Types.ObjectId,
        ref: "IdeaSession",
        required: true,
    },
    series:{
        type: Schema.Types.ObjectId,
        ref:"Series",
        // required:true,
    },
    world_building:{
        type:String,
        required:true
    },
    pacing_guide:{
        type:String,
    },

},{timestamps:true})


export const Structure=mongoose.model("Structure",structureSchema)