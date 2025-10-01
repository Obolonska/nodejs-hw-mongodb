import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export async function getAllContactsController(req, res) {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const data = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
}
export async function getContactByIdController(req, res) {
  const { id } = req.params;
  const data = await getContactById(id);
  if (data === null) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data,
  });
}

export async function createContactController(req, res) {
  const data = await createContact(req.body);
  console.log(data);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
}

export async function updateContactController(req, res) {
  const { id } = req.params;
  const data = await updateContact(id, req.body);
  if (data === null) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data,
  });
}

export async function deleteContactController(req, res) {
  const { id } = req.params;
  const data = await deleteContact(id);
  if (data === null) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.status(204).send();
}
