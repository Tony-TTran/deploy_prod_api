import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  let existingUser;
  try {
    existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch (error) {
    logger.error('Error checking for existing user:', error);
    throw new Error('Error checking for existing user', { cause: error });
  }

  if (existingUser.length > 0) {
    throw new Error('User already exists');
  }

  try {
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    logger.info(`User created: ${newUser.email}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Error creating user', { cause: error });
  }
};
