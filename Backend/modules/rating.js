import { Schema,Types,model } from "mongoose";

const ratingschema=new Schema({
  ratedUser:{
    type:Types.ObjectId,
    ref:"user",
    required:true
  },
  ratedBy:{
    type:Types.ObjectId,
    ref:"user",
    required:true
  },
  task:{
    type:Types.ObjectId,
    ref:"task",
    required:true
  },
  rating:{
    type:Number,
    min:1,
    max:5,
    required:true
  }
},{timestamps:true,versionKey:false});

export const ratingmodel = model("rating", ratingschema);
