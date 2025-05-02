import { NextResponse } from 'next/server';
import Post from "@/lib/models/post.model";
import { connect } from '@/lib/mongodb/mongoose';

export async function GET() {
  try {
    await connect();
    
    // const organizationId = "67e84cef001522de336670e9"; //Test Org
    // const communityId = "67e84ce27b99696289b14059"; //Test Community

    const organizationId = "67ec452ecbdc464abad2a5ee"; //St. Carlo
    const communityId = "67f635bb7620b7d0f173ba15"; //Founders

    const newPost = await Post.create({
      text: "Good Morning! - This is a test post from the system.",
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