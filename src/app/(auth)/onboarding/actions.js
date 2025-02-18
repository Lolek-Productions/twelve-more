'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboarding = async (formData) => {
  const { userId } = await auth()

  if (!userId) {
    return { message: 'No Logged In User' }
  }

  const client = await clerkClient()

  try {
    // ✅ Fetch existing metadata to merge new values
    const existingUser = await client.users.getUser(userId);

    const existingMetadata = existingUser.publicMetadata || {};

    // ✅ Merge existing metadata with new values
    const updatedMetadata = {
      ...existingMetadata, // Keep existing metadata
      onboardingComplete: true,
      smsOptIn: formData.get('smsOptIn') === 'on', // Convert checkbox value to boolean
    };


    // ✅ Update user metadata without deleting other fields
    const res = await client.users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    return { message: res.publicMetadata }
  } catch (err) {
    return { error: 'There was an error updating the user metadata.' }
  }
}