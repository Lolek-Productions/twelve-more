'use server'

import { currentUser } from '@clerk/nextjs/server';
import { createOrganizationWithWelcomingCommunity } from "@/lib/actions/organization.js";

export const completeOnboarding = async (formData) => {
  try {
    const user = await currentUser();
    const userId = user.publicMetadata.userMongoId;

    if (!userId) {
      return { success: false, message: 'No Logged In User' }
    }

    const organizationName = formData.get('organizationName');
    const description = formData.get('description') || '';

    if (!organizationName) {
      return { success: false, message: 'Organization name is required' }
    }

    const organizationResult = await createOrganizationWithWelcomingCommunity({
      name: organizationName,
      description: description,
    }, userId);

    if (!organizationResult?.success) {
      return { success: false, message: 'Failed to create organization' }
    }

    return {
      success: true,
      message: 'Organization created successfully!',
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete onboarding'
    }
  }
}