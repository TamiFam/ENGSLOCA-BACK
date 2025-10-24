import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Word from './models/Word.js';

dotenv.config();

const seedWords = [
  {
    word: "hello",
    translation: "привет",
    partOfSpeech: "interjection",
    category: "basic",
    examples: ["Hello, how are you?", "Say hello to your friend"],
    difficulty: "beginner"
  },
  {
    word: "world",
    translation: "мир",
    partOfSpeech: "noun", 
    category: "basic",
    examples: ["Hello world!", "Travel around the world"],
    difficulty: "beginner"
  },
  {
    word: "computer",
    translation: "компьютер",
    partOfSpeech: "noun",
    category: "technology", 
    examples: ["I work on my computer", "This computer is fast"],
    difficulty: "intermediate"
  },
  {
    word: "beautiful",
    translation: "красивый",
    partOfSpeech: "adjective",
    category: "descriptions",
    examples: ["She is beautiful", "What a beautiful day"],
    difficulty: "beginner"
  },
  {
    word: "understand",
    translation: "понимать", 
    partOfSpeech: "verb",
    category: "basic",
    examples: ["I understand you", "Do you understand this lesson?"],
    difficulty: "beginner"
  },
  {
    word: "development",
    translation: "разработка",
    partOfSpeech: "noun",
    category: "technology",
    examples: ["Web development", "Software development"],
    difficulty: "intermediate"
  },
  {
    word: "learning",
    translation: "обучение",
    partOfSpeech: "noun",
    category: "education",
    examples: ["Machine learning", "Online learning"],
    difficulty: "beginner"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Очищаем существующие слова
    await Word.deleteMany({});
    console.log('🗑️ Cleared existing words');

    // Добавляем начальные слова
    await Word.insertMany(seedWords);
    console.log(`✅ Added ${seedWords.length} words to database`);

    console.log('🎉 Database seeded successfully!');
    
    // Показываем добавленные слова
    const words = await Word.find();
    console.log('\n📋 Added words:');
    words.forEach(word => {
      console.log(`- ${word.word} → ${word.translation}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();