import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware runs in this order for every request, top to bottom.
app.use(helmet()); // sets security-related HTTP headers on every response
app.use(cors()); // allows requests from other origins (adds CORS headers)
app.use(express.json()); // parses JSON request bodies into req.body
app.use(express.urlencoded({ extended: true })); // parses form (x-www-form-urlencoded) bodies into req.body
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })); // logs each request via winston
app.use(cookieParser()); // parses the Cookie header into req.cookies

app.get('/', (req, res) => {
  logger.info('Received request for home page');
  res.status(200).send('Hello, World!');
});

export default app;
