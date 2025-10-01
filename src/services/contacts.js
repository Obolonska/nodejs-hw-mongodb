import { Contact } from '../db/models/contact.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
}) => {
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactQuery = Contact.find();

  if (filter.isFavourite !== undefined) {
    contactQuery.where('isFavourite').equals(filter.isFavourite);
  }
  if (filter.type) {
    contactQuery.where('contactType').equals(filter.type);
  }

  const [contacts, total] = await Promise.all([
    contactQuery
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage)
      .exec(),
    Contact.find().merge(contactQuery).countDocuments(),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getContactById = async (Id) => {
  const contact = await Contact.findById(Id);
  return contact;
};

export const createContact = async (payload) => {
  return Contact.create(payload);
};

export const deleteContact = async (Id) => {
  return Contact.findByIdAndDelete(Id);
};

export async function updateContact(studentId, payload) {
  return Contact.findByIdAndUpdate(studentId, payload, {
    new: true,
  });
}
