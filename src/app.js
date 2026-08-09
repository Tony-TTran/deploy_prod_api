import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(cookieParser());
app.get('/', (req, res) => {
  logger.info('Received request for home page');
  res.status(200).send('Hello, World!');
});

export default app;
