import mongoose from "mongoose";

const TestResultSchema = new mongoose.Schema({
  week: Number,        // номер недели или дата
  score: Number,       // результат теста
  date: { type: Date, default: Date.now },
  pageInfo: {          
    page: String,      // 'all' или номер страницы
    mode: String,      // 'page' или 'all'
    pageNumber: Number,
    wordsCount: Number,
    totalPages: Number
  }
});

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
  testResults: [TestResultSchema], // <── добавлено
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
