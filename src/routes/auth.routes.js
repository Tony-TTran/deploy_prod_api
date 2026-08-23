import express from 'express';
import { signup, signin, signout } from '../controllers/auth.controller.js';
// Router for everything mounted under /api/auth in app.js.
const router = express.Router();

// POST /api/auth/sign-up — validates the body, hashes the password, creates the user, signs a JWT cookie.
router.post('/sign-up', signup);

// POST /api/auth/sign-in — validates credentials against the database and signs a JWT cookie.
router.post('/sign-in', signin);

// POST /api/auth/sign-out — clears the auth cookie.
router.post('/sign-out', signout);

export default router;
