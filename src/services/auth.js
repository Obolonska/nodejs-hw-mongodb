import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcryptjs';
import { Session } from '../db/models/session.js';
import crypto from 'crypto';

async function createNewSession(userId) {
  return Session.create({
    userId,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 хвилин
    refreshTokenValidUntil: new Date(Date.now() + 24 * 30 * 60 * 60 * 1000), // 30 днів
  });
}

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) {
    throw new createHttpError.Conflict(409, 'Email in use');
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create(payload);
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw new createHttpError.Unauthorized('Email or password is wrong 1');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw new createHttpError.Unauthorized('Email or password is wrong');
  }

  await Session.deleteOne({ userId: user._id });
  return createNewSession(user._id);
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await Session.findOne({ _id: sessionId });
  if (!session) {
    throw new createHttpError.Unauthorized('Session not found');
  }

  if (session.refreshToken !== refreshToken) {
    throw new createHttpError.Unauthorized('Invalid refresh token');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw new createHttpError.Unauthorized('Refresh token expired');
  }

  await Session.deleteOne({ _id: session._id });
  return createNewSession(session.userId);
};
