import { Schema,Types,model } from "mongoose";

const notificationschema=new Schema({
  user:{
    type:Types.ObjectId,
    ref:"user",
    required:true
  },
  taskinfo:{
    type:Types.ObjectId,
    ref:"task",
    required:true
  },
  category:{
    type:String,
    enum:["regular","emergency"],
    default:"regular"
  },
  message:{
    type:String,
    required:true
  },
  read:{
    type:Boolean,
    default:false
  }
},{timestamps:true,versionKey:false});


export const notificationmodel=model("notification",notificationschema)
