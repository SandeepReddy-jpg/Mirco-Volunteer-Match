import { Schema,Types,model } from "mongoose";


const volunteerschema= new Schema({
  userinfo:{
    type:Types.ObjectId,
    ref:"user",
    required:true
  },
  interest:{
    type:[String],
    required:true
  },
  skills:{
    type:[String],
    required:true
  },
  rating:{
    type:Number,
    min:0,
    max:5,
    default:0
  }
},{timestamps:true,versionKey:false});


  export const volunteermodel=model("volunter",volunteerschema);

