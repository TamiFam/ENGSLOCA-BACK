// seedWords.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Word from './models/Word.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
const TIMA_USER_ID = '68fa096cb93a608925ea4639';

const wordsToAdd = [
  // 1. Устойчивые выражения с предлогами
  { word: "INTERESTED IN", translation: "ИНТЕРЕСОВАТЬСЯ ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "prepositional phrase" },
  { word: "READY FOR", translation: "ГОТОВ К", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "preposition" },
  { word: "READY TO DO", translation: "ГОТОВ СДЕЛАТЬ ЧТО-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "infinitive" },
  { word: "FOND OF", translation: "ЛЮБИТЬ (I'm fond of - я люблю)", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "KEEN ON", translation: "УВЛЕКАТЬСЯ (I'm keen on - я увлекаюсь)", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "FULL OF", translation: "ПОЛОН ЧЕГО-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "PROUD OF", translation: "ГОРДИТЬСЯ ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "KIND TO ME", translation: "ДОБР КО МНЕ", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "with pronoun" },
  { word: "NICE OF YOU", translation: "МИЛО С ТВОЕЙ СТОРОНЫ", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "polite phrase" },
  { word: "ADDICTED TO", translation: "ЗАВИСИМ ОТ", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "GOOD AT", translation: "ХОРОШ В ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "preposition" },
  { word: "BAD AT", translation: "ПЛОХ В ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "beginner", week: 5, notes: "preposition" },
  { word: "FAMOUS FOR", translation: "ЗНАМЕНИТ ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "TYPICAL OF", translation: "ТИПИЧЕН ДЛЯ", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "SURPRISED AT/BY", translation: "УДИВЛЕН ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "past participle" },
  { word: "SHOCKED AT/BY", translation: "ШОКИРОВАН ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "past participle" },
  { word: "EXCITED ABOUT", translation: "В ВОСТОРГЕ ОТ", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "SATISFIED WITH", translation: "УДОВЛЕТВОРЕН ЧЕМ-ТО", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "DISAPPOINTED ABOUT", translation: "РАЗОЧАРОВАН ЭТИМ", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5, notes: "preposition" },
  { word: "ADAPT TO", translation: "АДАПТИРОВАТЬСЯ К", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "COUNT ON", translation: "РАССЧИТЫВАТЬ НА", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "RELY ON", translation: "ПОЛАГАТЬСЯ НА", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb, произносится 'рилай'" },
  { word: "LEAD TO", translation: "ПРИВЕСТИ К", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "APPROVE OF", translation: "ОДОБРЯТЬ ЧТО-ТО", partOfSpeech: "verb", category: "verb", difficulty: "advanced", week: 5, notes: "phrasal verb" },
  { word: "CONSIST OF", translation: "СОСТОЯТЬ ИЗ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "CONGRATULATE ON", translation: "ПОЗДРАВЛЯТЬ С", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "REMIND OF", translation: "НАПОМНИТЬ О", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "MANAGE TO", translation: "СУМЕТЬ СДЕЛАТЬ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "infinitive pattern" },
  { word: "POINT OUT", translation: "ОТМЕТИТЬ, УКАЗАТЬ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "LOOK FOR", translation: "ИСКАТЬ", partOfSpeech: "verb", category: "verb", difficulty: "beginner", week: 5, notes: "phrasal verb" },
  { word: "SUCCEED IN DOING", translation: "ПРЕУСПЕТЬ, СУМЕТЬ СДЕЛАТЬ", partOfSpeech: "verb", category: "verb", difficulty: "advanced", week: 5, notes: "gerund pattern" },
  { word: "STICK TO", translation: "ПРИДЕРЖИВАТЬСЯ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  { word: "FOLLOW", translation: "СЛЕДИТЬ ЗА", partOfSpeech: "verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "LIVE UP TO", translation: "ОПРАВДЫВАТЬ ОЖИДАНИЯ", partOfSpeech: "verb", category: "verb", difficulty: "advanced", week: 5, notes: "phrasal verb" },
  { word: "KEEP SECRET", translation: "ХРАНИТЬ СЕКРЕТ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "verb + noun" },
  { word: "CHECK OUT", translation: "ПРОВЕРИТЬ, ГЛЯНУТЬ", partOfSpeech: "verb", category: "verb", difficulty: "intermediate", week: 5, notes: "phrasal verb" },
  
  // 2. Модальные глаголы
  { word: "should", translation: "СЛЕДУЕТ (совет)", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "shouldn't", translation: "НЕ СТОИТ, НЕ СЛЕДУЕТ", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "have to", translation: "НУЖНО (вынужденность)", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "must", translation: "ДОЛЖЕН (обязанность)", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "mustn't", translation: "ЗАПРЕЩЕНО", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  { word: "don't have to", translation: "НЕ ОБЯЗАТЕЛЬНО", partOfSpeech: "modal verb", category: "verb", difficulty: "beginner", week: 5 },
  
  // 3. Полезные фразы
  { word: "FROM MY POINT OF VIEW", translation: "С МОЕЙ ТОЧКИ ЗРЕНИЯ", partOfSpeech: "phrase", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "I HAD TO", translation: "Я ДОЛЖЕН БЫЛ", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5 },
  { word: "I'M ABOUT TO", translation: "Я СОБИРАЮСЬ (вот-вот)", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5 },
  { word: "DO YOU MIND", translation: "ТЫ НЕ ВОЗРАЖАЕШЬ?", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5 },
  { word: "LET ME BE CLEAR", translation: "ПОЗВОЛЬ МНЕ ВНЕСТИ ЯСНОСТЬ", partOfSpeech: "phrase", category: "verb", difficulty: "advanced", week: 5 },
  { word: "TO SOME", translation: "ДЛЯ НЕКОТОРЫХ", partOfSpeech: "phrase", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "I BET", translation: "БЬЮСЬ ОБ ЗАКЛАД", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5 },
  { word: "DESPITE", translation: "НЕСМОТРЯ НА", partOfSpeech: "preposition", category: "adverb", difficulty: "intermediate", week: 5 },
  { word: "MOSTLY", translation: "В ОСНОВНОМ", partOfSpeech: "adverb", category: "adverb", difficulty: "intermediate", week: 5 },
  
  // 4. Эмоции
  { word: "BITTERLY DISAPPOINTED", translation: "ГОРЬКО РАЗОЧАРОВАН", partOfSpeech: "phrase", category: "adjective", difficulty: "advanced", week: 5 },
  { word: "I'M NOT PICKY", translation: "Я НЕ ПРИВЕРЕДЛИВ", partOfSpeech: "phrase", category: "adjective", difficulty: "intermediate", week: 5 },
  { word: "I'M NO LONGER WORTHY", translation: "Я БОЛЬШЕ НЕ ДОСТОИН", partOfSpeech: "phrase", category: "adjective", difficulty: "advanced", week: 5 },
  { word: "DIGNITY", translation: "ДОСТОИНСТВО", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  
  // 5. Сленг из фильма
  { word: "LIGHTEN UP", translation: "РАССЛАБЬСЯ, УСПОКОЙСЯ", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5, notes: "slang" },
  { word: "SKIN THAT CAT", translation: "СОДРАТЬ ШКУРУ С КОТА", partOfSpeech: "phrase", category: "verb", difficulty: "advanced", week: 5, notes: "idiom" },
  { word: "GET YOUR HINDQUARTERS MOVING", translation: "ШЕВЕЛИ СВОЕЙ ЗАДНИЦЕЙ", partOfSpeech: "phrase", category: "verb", difficulty: "advanced", week: 5, notes: "slang" },
  { word: "BLOWOUT", translation: "БЛЕВАТЬ", partOfSpeech: "verb", category: "verb", difficulty: "advanced", week: 5, notes: "slang" },
  { word: "SUIT YOURSELF", translation: "КАК ХОЧЕШЬ, ДЕЛО ТВОЕ", partOfSpeech: "phrase", category: "verb", difficulty: "intermediate", week: 5, notes: "slang" },
  { word: "GUESS IT'S NOT YOUR NIGHT", translation: "ПОХОЖЕ, СЕГОДНЯ НЕ ТВОЙ ВЕЧЕР", partOfSpeech: "phrase", category: "noun", difficulty: "advanced", week: 5, notes: "slang" },
  { word: "FELLAS", translation: "РЕБЯТА", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5, notes: "slang" },
  { word: "QUACK", translation: "ШАРЛАТАН", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5, notes: "slang" },
  { word: "SLOPPY", translation: "НЕРЯШЛИВЫЙ, НЕБРЕЖНЫЙ", partOfSpeech: "adjective", category: "adjective", difficulty: "intermediate", week: 5 },
  { word: "HARD PASS", translation: "ТОЧНО НЕТ, ОТКАЗ", partOfSpeech: "phrase", category: "noun", difficulty: "advanced", week: 5, notes: "slang" },
  { word: "YOU GOT YOURSELF A DEAL", translation: "ПО РУКАМ", partOfSpeech: "phrase", category: "noun", difficulty: "intermediate", week: 5, notes: "slang" },
  
  // 6. Существительные
  { word: "SPOTTER", translation: "КОРРЕКТИРОВЩИК", partOfSpeech: "noun", category: "noun", difficulty: "advanced", week: 5 },
  { word: "SHELLFISH", translation: "МОЛЛЮСКИ", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "PRESCRIPTION", translation: "РЕЦЕПТ (врача)", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "LEFTOVERS", translation: "ОСТАТКИ ЕДЫ, ОБЪЕДКИ", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "LOAVES", translation: "БУХАНКИ ХЛЕБА", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "FANCIER", translation: "ЛЮБИТЕЛЬ, ЦЕНИТЕЛЬ", partOfSpeech: "noun", category: "noun", difficulty: "advanced", week: 5 },
  { word: "OUTLAW", translation: "ПРЕСТУПНИК", partOfSpeech: "noun", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "HERO", translation: "ГЕРОЙ", partOfSpeech: "noun", category: "noun", difficulty: "beginner", week: 5 },
  
  // 7. Наречия
  { word: "SOMEHOW", translation: "КАК-ТО, КАКИМ-ТО ОБРАЗОМ", partOfSpeech: "adverb", category: "adverb", difficulty: "intermediate", week: 5 },
  { word: "RIGHT AWAY", translation: "НЕМЕДЛЕННО, СРАЗУ ЖЕ", partOfSpeech: "adverb", category: "adverb", difficulty: "intermediate", week: 5 },
  { word: "DOWN TO", translation: "ВПЛОТЬ ДО", partOfSpeech: "phrase", category: "adverb", difficulty: "intermediate", week: 5 },
  { word: "IN THE FLESH", translation: "ВО ПЛОТИ", partOfSpeech: "phrase", category: "adverb", difficulty: "advanced", week: 5 },
  { word: "ACROSS THE LAND", translation: "ПО ВСЕЙ СТРАНЕ", partOfSpeech: "phrase", category: "adverb", difficulty: "intermediate", week: 5 },
  
  // 8. Целые предложения
  { word: "That's not a high bar to clear", translation: "ЭТО НЕ ТАК УЖ СЛОЖНО", partOfSpeech: "sentence", category: "noun", difficulty: "advanced", week: 5, notes: "idiom" },
  { word: "I loved by one and all", translation: "МЕНЯ ЛЮБЯТ ВСЕ БЕЗ ИСКЛЮЧЕНИЯ", partOfSpeech: "sentence", category: "verb", difficulty: "advanced", week: 5 },
  { word: "Anyone in particular?", translation: "КТО-ТО КОНКРЕТНЫЙ?", partOfSpeech: "sentence", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "Always on the lookout", translation: "ВСЕГДА НАЧЕКУ", partOfSpeech: "sentence", category: "adverb", difficulty: "intermediate", week: 5 },
  { word: "Let's get it over with", translation: "ДАВАЙ ПОКОНЧИМ С ЭТИМ", partOfSpeech: "sentence", category: "verb", difficulty: "advanced", week: 5 },
  { word: "We have gathered here today", translation: "МЫ СОБРАЛИСЬ ЗДЕСЬ СЕГОДНЯ", partOfSpeech: "sentence", category: "verb", difficulty: "intermediate", week: 5 },
  { word: "It would be a crime", translation: "ЭТО БЫЛО БЫ ПРЕСТУПЛЕНИЕМ", partOfSpeech: "sentence", category: "noun", difficulty: "intermediate", week: 5 },
  { word: "I said something salty", translation: "Я СКАЗАЛ ЧТО-ТО ЕДКОЕ", partOfSpeech: "sentence", category: "verb", difficulty: "advanced", week: 5, notes: "slang" },
  { word: "Full disclosure", translation: "ЧЕСТНО ГОВОРЯ", partOfSpeech: "phrase", category: "noun", difficulty: "advanced", week: 5 }
];

console.log('Количество слов для добавления:', wordsToAdd.length);

async function seedWords() {
  try {
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI не найден в .env файле!');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключились к MongoDB');

    const user = await User.findById(TIMA_USER_ID);
    if (!user) {
      console.log('❌ Пользователь не найден!');
      process.exit(1);
    }
    console.log(`👤 Слова будут созданы от имени: ${user.username}`);
    console.log(`📅 Все слова будут добавлены на неделю: 5`);

    // Добавляем AUTHOR (правильное поле!)
    const wordsWithUser = wordsToAdd.map(word => ({
      ...word,
      author: user._id,  // ← ТЕПЕРЬ ПРАВИЛЬНО: author
      examples: word.examples || [],
      notes: word.notes || ''
    }));

    // Проверяем существующие слова
    const existingWords = await Word.find({ 
      word: { $in: wordsToAdd.map(w => w.word) } 
    }).select('word');
    
    const existingWordList = existingWords.map(w => w.word);
    console.log('Слова, которые УЖЕ есть в базе:', existingWordList);
    
    // Отфильтровываем существующие
    const newWords = wordsWithUser.filter(w => !existingWordList.includes(w.word));
    console.log('Новых слов для добавления:', newWords.length);
    
    if (newWords.length > 0) {
      const result = await Word.insertMany(newWords, { ordered: false });
      console.log(`✅ Успешно добавлено ${result.length} новых слов!`);
    } else {
      console.log('❌ Все слова уже существуют в базе!');
    }
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Ошибка дубликата:', error.message);
    } else {
      console.error('❌ Ошибка:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Отключились от БД');
  }
}

seedWords();