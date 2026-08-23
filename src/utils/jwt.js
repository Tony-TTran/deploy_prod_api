import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

// Secret used to sign/verify tokens, and how long a signed token stays valid.
// Both fall back to hardcoded defaults if the env vars aren't set (the secret
// fallback is only safe for local dev — see note below).
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

export const jwt_token = {
  sign: (payload) => {
    try {
      // Create a signed JWT out of `payload`, embedding the expiration.
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error('Error signing JWT:', error);
      throw new Error('Failed to sign JWT', { cause: error });
    }
  },
  verify: (token) => {
    try {
      // Decode & validate a token signed with the same secret.
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to authenticate JWT:', error);
      throw new Error('Invalid token', { cause: error });
    }
  },
};
