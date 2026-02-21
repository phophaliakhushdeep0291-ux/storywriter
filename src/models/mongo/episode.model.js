import mongoose,{Schema} from "mongoose";


const episodeSchema=new Schema(
    {
        episode_no:{
            type:Number,
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        key_events:{
            type:String,

        },
        where_we_left_off:{
            type:String,
        },
        series:{
            type:Schema.Types.ObjectId,
            ref:"Series",
        }

},{timestamps:true})
export const Episode=mongoose.model("Episode",episodeSchema)