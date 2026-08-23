import { z } from 'zod';

// Expected shape of a POST /api/auth/sign-up request body.
// Not yet actually applied inside src/routes/auth.routes.js — defined here for when that route is wired up.
export const signUpSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(255).trim(),
  email: z.string().email({ message: 'Invalid email address' }).trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(28),
  role: z.enum(['user', 'admin']).default('user'),
});

// Expected shape of a POST /api/auth/sign-in request body.
export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(28),
});
