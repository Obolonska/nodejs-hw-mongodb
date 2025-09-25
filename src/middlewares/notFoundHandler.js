import createHttpError from 'http-errors';

export default function notFoundHandler(req, res, next) {
  next(new createHttpError.NotFound('Route not found'));
}
