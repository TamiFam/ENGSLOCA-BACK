import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
  category: { type: String, required: true },
  examples: [String],
  difficulty: { type: String, default: 'beginner' },
  week: { type: Number, required: true, default: 1 }, // 👈 Добавляем неделю
  transcriptionUK: {type: String},
  transcriptionUS: {type: String},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Word', wordSchema);