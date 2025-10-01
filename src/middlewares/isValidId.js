import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export function isValidId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    throw new createHttpError.BadRequest('Invalid ID format');
  }
  next();
}
