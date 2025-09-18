/*Створіть свій кластер в mongodb та функцію initMongoConnection для встановлення зʼєднання з нею*/
import mongoose from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar.js';

// const URL = `mongodb+srv://obolonska:bg6ZPtmOK5w3qEfy@cluster0.0rcxl7b.mongodb.net/Contacts?retryWrites=true&w=majority&appName=Cluster0`;
export const initMongoDB = async () => {
  try {
    const user = getEnvVar('MONGODB_USER');
    const pwd = getEnvVar('MONGODB_PASSWORD');
    const url = getEnvVar('MONGODB_URL');
    const db = getEnvVar('MONGODB_DB');

    console.log('user:', user);
    console.log('pwd:', pwd);
    console.log('url:', url);
    console.log('db:', db);
    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`,
    );
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
