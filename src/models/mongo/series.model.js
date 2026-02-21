import mongoose,{Schema} from "mongoose";

const seriesSchema=new Schema(
    {
        title:{
            type:String,
            required:true,
        },
        genre:{
            type:String,
        },
        core_idea:{
            type:String
        },
        overall_plot:{
            type:String
        },
        tone:{
            type:String
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },{timestamps:true})
    export const Series=mongoose.model("Series",seriesSchema)