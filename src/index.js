import { initMongoDB } from './db/initMongoConnection.js';
import setupServer from './server.js';

const bootstrap = async () => {
  await initMongoDB();
  setupServer().catch((error) => console.error(error));
};

bootstrap();
