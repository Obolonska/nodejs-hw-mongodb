import * as fs from 'node:fs';
import path from 'node:path';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcryptjs';
import { Session } from '../db/models/session.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import Handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';

const REQUEST_PASSWORD_RESET_TEMPLATE = fs.readFileSync(
  path.resolve('src/templates/request-password-reset.html'),
  'utf-8',
);

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
    throw new createHttpError.Conflict('Email in use');
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create(payload);
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw new createHttpError.Unauthorized('Email or password is wrong');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw new createHttpError.Unauthorized('Email or password is wrong');
  }

  await Session.deleteOne({ userId: user._id });
  return createNewSession(user._id);
};

export const logoutUser = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new createHttpError.Unauthorized('Session not found');
  }
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

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw new createHttpError.NotFound('User not found!');
  }
  const token = jwt.sign({ sub: user._id }, getEnvVar('JWT_SECRET'), {
    expiresIn: '5m',
  });
  const template = Handlebars.compile(REQUEST_PASSWORD_RESET_TEMPLATE);

  try {
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: template({
        user: { email: user.email, name: user.name },
        resetLink: `https://${getEnvVar(
          'APP_DOMAIN',
        )}/reset-password?token=${token}`,
      }),
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new createHttpError.InternalServerError(
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (token, password) => {
  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));
    const hashedPassword = await bcrypt.hash(password, 10);
    await UsersCollection.findByIdAndUpdate(decoded.sub, {
      password: hashedPassword,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new createHttpError.Unauthorized('Token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new createHttpError.Unauthorized('Invalid token');
    }
    throw err;
  }
};

export const loginOrRegister = async (email, name) => {
  let user = await UsersCollection.findOne({ email });
  if (!user) {
    const randomPassword = await bcrypt.hash(
      crypto.randomBytes(10).toString('base64'),
      10,
    );
    user = await UsersCollection.create({
      email,
      name,
      password: randomPassword,
    });
  }
  await Session.deleteOne({ userId: user._id });
  return createNewSession(user._id);
};
