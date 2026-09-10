import { Schema,Types,model } from "mongoose";

const taskschema=new Schema({
  postedBy:{
    type:Types.ObjectId,
    ref:"user",
    required:true
  },
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  category:{
    type:[String],
    required:true
  },
  members:{
    type:Number,
    default:1
  },
  status:{
    type:String,
    enum:["open","accepted","completed"],
    default:"open",
  },
  accepted:{
    type:[Types.ObjectId],
    ref:"user",
    default:[]
  },
  completedBy:{
    type:Types.ObjectId,
    ref:"user",
    default:null
  }


},{timestamps:true,versionKey:false})


export const taskmodel=model("task",taskschema)
