import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    // Health Profile Details
    dateOfBirth: {
      type: String, // Stored as YYYY-MM-DD
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    height: {
      type: Number, // in cm
      default: null,
    },
    weight: {
      type: Number, // in kg
      default: null,
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    activityLevel: {
      type: String, // 'Sedentary' | 'Moderate' | 'Active' | 'Elite'
      default: "Moderate",
    },
    allergies: {
      type: String,
      default: "",
    },
    existingConditions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
