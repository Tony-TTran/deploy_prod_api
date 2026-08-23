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

// Check a plaintext password against the bcrypt hash stored for a user.
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Error comparing password', { cause: error });
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

// Look up a user by email and verify their password for sign-in.
// Both "no such user" and "wrong password" throw the same generic error so
// the API response doesn't leak which one it was (avoids email enumeration).
export const authenticateUser = async ({ email, password }) => {
  let existingUser;
  try {
    existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  } catch (error) {
    logger.error('Error looking up user for sign-in:', error);
    throw new Error('Error looking up user for sign-in', { cause: error });
  }

  const [user] = existingUser;
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  logger.info(`User signed in: ${user.email}`);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
