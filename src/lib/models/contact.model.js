// models/Contact.js

import mongoose from 'mongoose';

// Define the contact schema
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameParts: {
      title: { type: String, default: '' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      fullName: { type: String, default: '' },
    },
    role: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    officeHours: {
      type: String,
      default: null,
    },
    parish: {
      type: String,
      trim: true,
      index: true,
    },
    parishWebsite: {
      type: String,
      trim: true,
    },
    parishAddress: {
      type: String,
      trim: true,
    },
    addressComponents: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    state: {
      type: String,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'contacts', // Specify collection name
  }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;