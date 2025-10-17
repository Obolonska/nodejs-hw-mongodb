import { Contact } from '../db/models/contact.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
  userId,
}) => {
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactQuery = Contact.find({ userId });

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

export const getContactById = async (contactId, { userId }) => {
  const contact = await Contact.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload) => {
  return Contact.create(payload);
};

export const deleteContact = async (contactId, { userId }) => {
  return Contact.findOneAndDelete({ _id: contactId, userId });
};
export async function updateContact(contactId, payload) {
  return Contact.findOneAndUpdate(
    { _id: contactId, userId: payload.userId },
    payload,
    { new: true },
  );
}
