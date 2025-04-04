'use server'

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Contact from '../src/lib/models/contact.model.js';

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script:
// node scripts/importContactInfoFromLance.js

export async function importContactsToMongoDB() {
  const filePath = "./scripts/contactInfo.json";

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'twelve-more-app',
    });

    // Read and parse JSON file
    const jsonData = fs.readFileSync(path.resolve(filePath), 'utf8');
    const contacts = JSON.parse(jsonData);

    // console.log(contacts.length)
    // return contacts;

    // Process data before insertion
    const processedContacts = contacts.map(contact => {
      // Extract name parts (handling titles like "Rev. Msgr.")
      const nameParts = processNameParts(contact.name);

      // Extract address components
      const addressComponents = processAddress(contact.parishAddress);

      return {
        ...contact,
        nameParts,
        addressComponents,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const result = await Contact.insertMany(processedContacts);

    console.log(`${result.length} contacts successfully imported to MongoDB`);

    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error importing contacts to MongoDB:', error);
  }
}

/**
 * Helper function to process name parts
 * @param {string} fullName The full name with possible titles
 * @returns {object} Object containing name parts
 */
function processNameParts(fullName) {
  if (!fullName) return { title: '', firstName: '', lastName: '', fullName };

  // Handle the full title part first (e.g., "Rev. Msgr.")
  const titleRegex = /^(Rev\.|Rev\. Msgr\.|Fr\.|Deacon|Sr\.|Dr\.|Mr\.|Mrs\.|Ms\.)?\s*/;
  const titleMatch = fullName.match(titleRegex);
  const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';

  // Remove the title and any role information in parentheses or after a comma
  let nameWithoutTitle = fullName.replace(titleRegex, '').replace(/,.*$/, '').replace(/\(.*\)/, '').trim();

  // Extract first and last name (simple approach)
  const nameParts = nameWithoutTitle.split(' ');
  let firstName = '';
  let lastName = '';

  if (nameParts.length === 1) {
    lastName = nameParts[0];
  } else if (nameParts.length >= 2) {
    firstName = nameParts.slice(0, -1).join(' ');
    lastName = nameParts[nameParts.length - 1];
  }

  return {
    title,
    firstName,
    lastName,
    fullName
  };
}

/**
 * Helper function to process address components
 * @param {string} fullAddress The complete address
 * @returns {object} Object containing address components
 */
function processAddress(fullAddress) {
  if (!fullAddress) return { street: '', city: '', state: '', zipCode: '', fullAddress };

  // Common US address format: Street, City, State ZipCode
  const addressRegex = /^(.*?),\s*(.*?),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/;
  const match = fullAddress.match(addressRegex);

  if (match) {
    return {
      street: match[1].trim(),
      city: match[2].trim(),
      state: match[3].trim(),
      zipCode: match[4].trim(),
      fullAddress
    };
  }

  // Fallback if the regex doesn't match
  const parts = fullAddress.split(',').map(part => part.trim());
  return {
    street: parts[0] || '',
    city: parts.length > 1 ? parts[1] : '',
    state: parts.length > 2 ? parts[2].split(' ')[0] : '',
    zipCode: parts.length > 2 ? parts[2].split(' ').slice(1).join(' ') : '',
    fullAddress
  };
}

importContactsToMongoDB().catch(console.error);