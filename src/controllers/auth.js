import createHttpError from 'http-errors';
import {
  loginOrRegister,
  logoutUser,
  refreshSession,
  registerUser,
  requestResetToken,
} from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { resetPassword } from '../services/auth.js';
import { getGoogleOAuthUrl, validateCode } from '../utils/googleOauth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
export const logoutUserController = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    throw new createHttpError.Unauthorized('Session not found');
  }
  await logoutUser(sessionId);
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};
export const refreshSessionController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  const session = await refreshSession(sessionId, refreshToken);

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
export const requestResetPasswordController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body.token, req.body.newPassword);
  // Логіка для скидання паролю
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

export const getOAuthUrlController = (req, res) => {
  const oauthUrl = getGoogleOAuthUrl();
  res.status(200).json({
    status: 200,
    message: 'Successfully get OAuth URL!',
    data: {
      oauth_url: oauthUrl,
    },
  });
};

export const confirmOAuthController = async (req, res) => {
  const ticket = await validateCode(req.body.code);
  const session = await loginOrRegister(
    ticket.payload.email,
    ticket.payload.name,
  );

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully confirmed OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
