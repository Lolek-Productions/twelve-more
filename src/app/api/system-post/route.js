import { NextResponse } from 'next/server';
import Post from "@/lib/models/post.model";
import { connect } from '@/lib/mongodb/mongoose';

export async function GET() {
  try {
    await connect();
    
    const organizationId = "67e84cef001522de336670e9";
    const communityId = "67e84ce27b99696289b14059";

    const newPost = await Post.create({
      text: "TEST - This is the daily system post.",
      community: communityId,
      organization: organizationId,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'System post created.',
    });
  } catch (error) {
    console.error('Error creating system post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create system post.', error: error.message },
      { status: 500 }
    );
  }
}