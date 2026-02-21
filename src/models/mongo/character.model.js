import mongoose,{Schema} from "mongoose";

const characterSchema=new Schema(
    {
        name:{
            type:String,
            required:true
        },
        personality_traits:{
            type:String,
        },
        speaking_style:{
            type:String,
        },
        background:{
            type:String,
        },
        arc_status:{
            type:String,
        },
        series: {
            type: Schema.Types.ObjectId,
            ref: "Series",
            required: true
        }
},{timestamps:true})
export const Character=mongoose.model("Character",characterSchema)