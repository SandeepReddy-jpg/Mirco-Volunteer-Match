import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userschema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["volunteer", "organizer", "admin"],
      default: "volunteer",
    },
    interest: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    contributionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: {
      type: [String],
      default: ["Rookie"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Password is optional Ã¢â‚¬â€ OAuth users don't have one
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// Only hash when password is present and modified
userschema.pre("save", async function hashPassword() {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Safe compare Ã¢â‚¬â€ returns false for OAuth users with no stored password
userschema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

export const usermodel = model("user", userschema);
