import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true,unique: true },
  translation: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, default: 'beginner' },
  examples: [{ type: String }],  
  notes: { type: String }, 
  week: { type: Number, required: true, default: 1 }, 
  transcriptionUK: {type: String},
  transcriptionUS: {type: String},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Word', wordSchema);