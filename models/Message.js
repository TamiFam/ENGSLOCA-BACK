import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  user: {
    id: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ["viewer", "member", "admin", "system"]
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Индекс для быстрого поиска по дате
MessageSchema.index({ timestamp: -1 });

export default mongoose.model("Message", MessageSchema);