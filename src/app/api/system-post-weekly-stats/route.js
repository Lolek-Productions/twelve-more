import { NextResponse } from 'next/server';
import { postSystemStatsToDevelopersCommunity } from '@/lib/actions/system-post';

export async function GET() {
  try {
    const result = await postSystemStatsToDevelopersCommunity();

    return NextResponse.json({ 
      success: true, 
      message: result.message,
    });
  } catch (error) {
    console.error('Error creating system post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create system post.', error: error.message },
      { status: 500 }
    );
  }
}