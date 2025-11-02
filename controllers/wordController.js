import Word from "../models/Word.js";

export const createWord = async (req, res) => {
  try {
    console.log('📝 Данные для создания слова:', req.body);
    // const {name} = req.body
    // const exsitingWord = await Word.find({name})

    // if(exsitingWord) {
    //   return  res.status(400).json({
    //     message: 'Слово уже существует',
    //     word: exsitingWord

    //   })
    // }
    
    
    const wordData = {
      ...req.body,
      author: req.user.id
    };
    
    const word = await Word.create(wordData);
    console.log('✅ Слово создано:', word);
    await word.populate('author', 'username role');
    
    res.status(201).json(word);
  } catch (err) {
    console.error('❌ Ошибка при создании слова:', err);


    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Слово уже существует' 
      });
    }


    res.status(500).json({ 
      message: "Ошибка при создании слова",
      error: err.message 
    });
  }
};

export const getWords = async (req, res) => {
  try {
    const { 
      search = "", 
      category, 
      partOfSpeech, 
      week,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};

    if (search) query.word = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (partOfSpeech) query.partOfSpeech = partOfSpeech;
    if (week) query.week = Number(week);

    const total = await Word.countDocuments(query);
    const words = await Word.find(query)
    .populate('author', 'username role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ 
      words, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / limit),
      currentWeek: week ? Number(week) : null
    });
  } catch (err) {
    console.error('❌ Ошибка при получении слов:', err);
    res.status(500).json({ message: "Ошибка при получении слов" });
  }
};

export const updateWord = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) return res.status(404).json({ message: "Слово не найдено" });

    // Временно убираем проверку авторизации
    // if (word.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Нет доступа" });
    // }

    Object.assign(word, req.body);
    await word.save();

    res.json(word);
  } catch (err) {
    console.error('❌ Ошибка при обновлении:', err);
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
};

export const deleteWord = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) return res.status(404).json({ message: "Слово не найдено" });

    // Временно убираем проверку авторизации
    // if (word.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Нет доступа" });
    // }

    await word.deleteOne();
    res.json({ message: "Слово удалено" });
  } catch (err) {
    console.error('❌ Ошибка при удалении:', err);
    res.status(500).json({ message: "Ошибка при удалении" });
  }
};

export const getAvailableWeeks = async (req, res) => {
  try {
    const weeks = await Word.distinct("week");
    res.json({ weeks: weeks.sort((a, b) => a - b) });
  } catch (err) {
    console.error('❌ Ошибка при получении недель:', err);
    res.status(500).json({ message: "Ошибка при получении списка недель" });
  }
};
export const getWordsByWeek = async (req, res) => {
  try {
    const { week } = req.params;
    
    if (!week) {
      return res.status(400).json({ message: "Не указана неделя" });
    }

    const words = await Word.find({ week: Number(week) })
      .populate('author', 'username role')
      .sort({ createdAt: -1 });

    console.log(`📚 Найдено ${words.length} слов для недели ${week}`);

    res.json({ 
      success: true,
      data: {
        week: Number(week),
        words: words,
        count: words.length
      }
    });
  } catch (err) {
    console.error('❌ Ошибка при получении слов по неделе:', err);
    res.status(500).json({ 
      message: "Ошибка при получении слов",
      error: err.message 
    });
  }
};