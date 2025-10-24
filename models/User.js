import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["viewer", "member", "admin"], 
    default: "member" 
  },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);