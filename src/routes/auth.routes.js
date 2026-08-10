import express from 'express';

// Router for everything mounted under /api/auth in app.js.
const router = express.Router();

// Example route for user login
// POST /api/auth/sign-up — placeholder; not yet wired to validation, hashing, or the database.
router.post('/sign-up', (req, res) => {
    res.send('POST /api/auth/sign-up route');
});

// POST /api/auth/sign-in — placeholder; not yet wired to credential checking or issuing a JWT.
router.post('/sign-in', (req, res) => {
    res.send('POST /api/auth/sign-in route');
});

// POST /api/auth/sign-out — placeholder; not yet wired to clearing the auth cookie.
router.post('/sign-out', (req, res) => {
    res.send('POST /api/auth/sign-out route');
});

export default router;
