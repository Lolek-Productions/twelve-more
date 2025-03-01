import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import twilioService from '@/lib/services/twilioService';
import { addCommunityToUser, getUserByClerkId } from '@/lib/actions/user';
import {handleClerkError, normalizePhoneNumber} from "@/lib/utils";

// Utility to validate request body
const validateRequestBody = ({ firstName, lastName, phoneNumber, communityId }) => {
  const missingFields = {};
  if (!firstName) missingFields.firstName = 'First name is required';
  if (!lastName) missingFields.lastName = 'Last name is required';
  if (!phoneNumber) missingFields.phoneNumber = 'Phone number is required';
  if (!communityId) missingFields.communityId = 'CommunityId is required';

  if (Object.keys(missingFields).length > 0) {
    return { isValid: false, error: 'Missing required fields', details: missingFields };
  }
  return { isValid: true };
};

// Fetch or create Clerk user
const getOrCreateClerkUser = async (client, { firstName, lastName, phoneNumber }) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const existingUsers = await client.users.getUserList({ phoneNumber: [normalizedPhone] });

  if (existingUsers.data.length > 0) {
    const user = existingUsers.data[0];
    console.log('Existing user found:', JSON.stringify(user, null, 2));
    return user;
  }

  const user = await client.users.createUser({
    firstName,
    lastName,
    phoneNumber: [normalizedPhone],
    publicMetadata: { smsOptIn: true },
  });
  console.log('User created:', JSON.stringify(user, null, 2));
  return user;
};

// Utility function to poll for MongoDB user
const pollForMongoUser = async (clerkUserId, maxAttempts = 5, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const mongoUserResult = await getUserByClerkId(clerkUserId);

      if (mongoUserResult.success) {
        console.log(`MongoDB user found on attempt ${attempt}:`, mongoUserResult.user.id);
        return { success: true, user: mongoUserResult.user };
      }

      console.log(`Attempt ${attempt}: MongoDB user not found yet`);

      // Wait before next attempt if not the last one
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        return { success: false, error: `Failed to find MongoDB user after ${maxAttempts} attempts: ${error.message}` };
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { success: false, error: `MongoDB user not found after ${maxAttempts} attempts` };
};

// Send SMS invitation
const sendCommunityInvitation = async (firstName, phoneNumber, communityId) => {
  const communityLink = `https://twelvemore.social/communities/${communityId}`;
  const messageBody = `Hi ${firstName}, you've been invited to join a community! Click here to check it out: ${communityLink}`;

  const smsResult = await twilioService.sendSMS(normalizePhoneNumber(phoneNumber), messageBody);
  if (!smsResult.success) {
    console.error('SMS failed:', smsResult.message);
  } else {
    console.log('SMS result:', smsResult.message);
  }
  return smsResult.success;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, phoneNumber, communityId } = body;

    // Validate request body
    const validation = validateRequestBody(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // 1. Fetch or create Clerk user
    const clerkUser = await getOrCreateClerkUser(client, { firstName, lastName, phoneNumber });

    // 2. Poll MongoDB until user is found
    const pollResult = await pollForMongoUser(clerkUser.id);
    if (!pollResult.success) {
      console.error('Polling failed:', pollResult.error);
      return NextResponse.json(
        { error: 'Failed to sync user with database', details: pollResult.error },
        { status: 500 }
      );
    }

    // 3. Add community to user
    await addCommunityToUser(communityId, pollResult.user.id);

    // 4. Send SMS invitation
    await sendCommunityInvitation(firstName, phoneNumber, communityId);

    return NextResponse.json({ success: true, userId: clerkUser.id });
  } catch (error) {
    return handleClerkError(error);
  }
}