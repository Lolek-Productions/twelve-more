import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    const client = await clerkClient();

    // Create the user
    const user = await client.users.createUser({
      phoneNumber: [normalizedPhone], // Use dynamic phoneNumber
      publicMetadata: { invitationOrganizationId: 'sup9er coool organization'},
      skipLegalChecks: true,
    });

    console.log('User created:', JSON.stringify(user, null, 2));

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