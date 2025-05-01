import { NextResponse } from 'next/server';
import { createPost } from '@/lib/actions/post';

export async function GET() {
  const organizationId = "67e84cef001522de336670e9";
  const communityId = "67e84ce27b99696289b14059";

  await createPost({
    text: "TEST - This is the daily system post.",
    organizationId,
    communityId,
  });

  return NextResponse.json({ success: true, message: 'System post created.' });
}
