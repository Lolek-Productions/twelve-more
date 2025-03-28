"use server";

import { clerkClient } from '@clerk/nextjs/server';
import {normalizePhoneNumber} from "@/lib/utils";

export async function lookupPhoneNumber( phoneNumber ) {
  try {
    const client = await clerkClient();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const existingUsers = await client.users.getUserList({ phoneNumber: [normalizedPhone] });

    if (existingUsers.data.length > 0) {
      // Map the users to a clean array with firstName and lastName
      const cleanUsers = existingUsers.data.map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.id,
      }));
      console.log('Clean user array:', cleanUsers);
      return {success: true, users: cleanUsers}; // Return the first user for consistency with your original logic
    }

  } catch (error) {
    return {success: false, message: "problem retrieving user"};
  }
}

export async function checkPhoneExists(phoneNumber) {
  try {
    const client = await clerkClient();
    if (!phoneNumber) {
      return { success: false, message: 'Phone number is required' };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if a user with this phone number exists
    const users = await client.users.getUserList({
      phoneNumber: [normalizedPhone],
    });

    // If users array has entries, the phone number is registered
    const exists = users.length > 0;

    return {
      success: true,
      exists
    };
  } catch (error) {
    console.error('Error checking phone number:', error);
    return {
      success: false,
      message: 'Failed to check phone number'
    };
  }
}