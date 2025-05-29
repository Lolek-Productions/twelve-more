"use server";

import { createOrUpdateUser } from "@/lib/actions/user";
import { clerkClient } from '@clerk/nextjs/server';
import { completeOnboarding } from "../onboarding/actions";

export async function onboardDeveloperAction({clerkId, firstName, lastName, imageUrl, phoneNumber}) {

  const phoneNumbers = [phoneNumber];
  const emailAddresses = null;

  try {
    const user = await createOrUpdateUser(
      clerkId,
      firstName,
      lastName,
      imageUrl,
      emailAddresses,
      phoneNumbers,
    );
    console.log('User Created in Mongo:', user)
    console.log('Clerk User Id:', clerkId)

    try {
      const mongoUserId = user._id.toString();
      console.log('mongoUserId:', mongoUserId);

      const client = await clerkClient()
      const response = await client.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          userMongoId: mongoUserId,
          smsOptIn:true,
          onboardingComplete:true,
        },
      });
      
      const result = await completeOnboarding({
        organizationName: 'Developer',
        description: 'Developer Organization',
      });

      console.log('Result from completeOnboarding:', result)

    } catch (error) {
      console.log('Error updating user metadata:', error);
    }

  } catch (error) {
    console.log('Error creating or updating user:', error);
    return new Response('Error occurred', {
      status: 400,
    });
  }
  return {
    success: true,
    message: "Developer onboarding complete!",
  };
}
