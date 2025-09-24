import createHttpError from 'http-errors';

export default function notFoundHandler(req, res, next) {
  next(new createHttpError.NotFound('Contact not found'));
}
