import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { firstName, lastName, phoneNumber } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            firstName: !firstName ? 'First name is required' : undefined,
            lastName: !lastName ? 'Last name is required' : undefined,
            phoneNumber: !phoneNumber ? 'Phone number is required' : undefined
          }
        },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    const client = await clerkClient();

    // Create the user with firstName and lastName
    const user = await client.users.createUser({
      firstName: firstName,
      lastName: lastName,
      phoneNumber: [normalizedPhone],
      skipLegalChecks: true,
    });

    console.log('User created:', JSON.stringify(user, null, 2));

    //Need to add user to community

    //Need to send text message to new user



    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    // Log the full error details
    console.error(
      'Clerk error:',
      JSON.stringify(
        {
          status: error.status,
          message: error.message,
          errors: error.errors,
          clerkTraceId: error.clerkTraceId,
        },
        null,
        2
      )
    );

    const errorDetails = error.errors?.map(err => ({
      code: err.code,
      message: err.message,
      longMessage: err.longMessage || err.message,
    })) || [{ message: error.message || 'Unknown error' }];

    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: errorDetails,
      },
      { status: error.status || 500 }
    );
  }
}