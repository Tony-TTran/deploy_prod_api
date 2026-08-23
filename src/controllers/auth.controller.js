import logger from '#config/logger.js';
import { signUpSchema, signInSchema } from '#validate/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { jwt_token } from '#utils/jwt.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: validationResult.error.issues,
        detail: formatValidationErrors(validationResult.error),
      });
    }
    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });
    const token = jwt_token.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);

    logger.info('Creating user with email:', email);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signup controller:', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    next(error); // Pass the error to the global error handler
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: validationResult.error.issues,
        detail: formatValidationErrors(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });
    const token = jwt_token.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);

    logger.info(`User signed in: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signin controller:', error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    next(error); // Pass the error to the global error handler
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');
    logger.info('User signed out');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    logger.error('Error in signout controller:', error);
    next(error); // Pass the error to the global error handler
  }
};
