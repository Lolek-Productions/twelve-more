"use server";

import { clerkClient } from '@clerk/nextjs/server';
import {handleClerkError, normalizePhoneNumber} from "@/lib/utils";

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