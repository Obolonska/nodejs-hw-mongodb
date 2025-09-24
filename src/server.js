import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initMongoDB } from './db/initMongoConnection.js';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

dotenv.config();
const app = express();

const PORT = Number(getEnvVar('PORT', '3000'));

export default async function setupServer() {
  try {
    await initMongoDB();

    app.use(express.json());
    app.use(cors());

    app.use(
      pino({
        transport: {
          target: 'pino-pretty',
        },
      }),
    );
    app.use(express.json());
    app.use('/contacts', contactsRouter);

    app.use((req, res, next) => {
      console.log(`Time: ${new Date().toLocaleString()}`);
      next();
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log('Server is running...');
  } catch (error) {
    console.error(error);
  }
}
