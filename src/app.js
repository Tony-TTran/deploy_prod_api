import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from '#routes/auth.routes.js'; // router mounted under /api/auth below
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();

// Middleware runs in this order for every request, top to bottom.
app.use(helmet()); // sets security-related HTTP headers on every response
app.use(cors()); // allows requests from other origins (adds CORS headers)
app.use(express.json()); // parses JSON request bodies into req.body
app.use(express.urlencoded({ extended: true })); // parses form (x-www-form-urlencoded) bodies into req.body
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
); // logs each request via winston
app.use(cookieParser()); // parses the Cookie header into req.cookies
app.use(securityMiddleware); // custom security middleware for rate limiting and bot detection

app.get('/', (req, res) => {
  logger.info('Received request for home page');
  res.status(200).send('Hello, World!');
});

// Basic liveness check — useful for uptime monitors / load balancer health probes.
app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple sanity-check endpoint confirming the API is reachable.
app.get('/api', (req, res) => {
  logger.info('API endpoint called');
  res
    .status(200)
    .json({ message: 'api is running', timestamp: new Date().toISOString() });
});

// Everything in auth.routes.js (sign-up/sign-in/sign-out) is reachable under /api/auth/*.
app.use('/api/auth', routes);

// Catch-all for any request that didn't match a route above.
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Error-handling middleware (4 args = Express treats this specially): catches errors
// passed via next(err) or thrown in async route handlers, logs them, and returns a
// generic 500 instead of leaking internals to the client. `next` is required so
// Express recognizes this as error-handling middleware (checked via fn arity),

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
