import * as fs from 'node:fs';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initMongoDB } from './db/initMongoConnection.js';
import { getEnvVar } from './utils/getEnvVar.js';
import router from './routers/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'node:path';

const SWAGGER_DOCUMENT = JSON.parse(
  fs.readFileSync(path.join('docs', 'swagger.json'), 'utf-8'),
);

dotenv.config();
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCUMENT));
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
    app.use(cookieParser());

    app.use(router);

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
