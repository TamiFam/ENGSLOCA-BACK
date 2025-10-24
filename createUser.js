// server/createUser.js
import bcrypt from 'bcrypt';
import User from './models/User.js'; // ваша модель пользователя
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Подключаемся к базе
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'andrey'; // email из аргументов
    const password = 'chesslove'; // пароль из аргументов
    const role = process.argv[4] || 'user'; // роль (по умолчанию user)

    if (!email || !password) {
      console.log('❌ Usage: node createUser.js <email> <password> [role]');
      console.log('Example: node createUser.js admin@mail.ru 123456 admin');
      process.exit(1);
    }

    // Проверяем есть ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser);
      process.exit(1);
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await User.create({
      email,
      passwordHash,
      role: role
    });

    console.log('✅ User created successfully:');
    console.log('📧 Email:', user.email);
    console.log('👤 Role:', user.role);
    console.log('🆔 ID:', user._id);
    console.log('📅 Created:', user.createdAt);

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

createAdminUser();