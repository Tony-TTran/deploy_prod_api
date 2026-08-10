import jwt from "jsonwebtoken";
import logger from "#config/logger.js";

// Secret used to sign/verify tokens, and how long a signed token stays valid.
// Both fall back to hardcoded defaults if the env vars aren't set (the secret
// fallback is only safe for local dev — see note below).
const JWT_SECRET = process.env.JWT_SECRET || "please-change-this-secret";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1d";

export const jwt_token = {
    sign: (payload) => {
    try {
        // Create a signed JWT out of `payload`, embedding the expiration.
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
        logger.error("Error signing JWT:", error);
        throw new Error("Failed to sign JWT");
    }
    // NOTE: this label + arrow function is dead code, not an object property.
    // Because the `try` above always returns and the `catch` above always
    // throws, execution never reaches here — and even if it did, `verify:`
    // here is a statement label (not part of the `jwt_token` object literal),
    // so this function is never assigned anywhere. `jwt_token.verify` is
    // currently `undefined`; calling it will throw "not a function".
    verify: (token) => {
        try {
            // Decode & validate a token signed with the same secret.
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error("Failed to authenticate JWT:", error);
            throw new Error("Invalid token");
        }
    }

}};
