import { Contact } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
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
