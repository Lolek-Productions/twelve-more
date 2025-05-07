import { NextResponse } from 'next/server';
import Post from '@/lib/models/post.model';
import { connect } from '@/lib/mongodb/mongoose';

export async function POST(req) {
  let event;
  try {
    event = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only handle Mux asset ready events
  if (event.type === 'video.asset.ready') {
    const muxAssetId = event.data.id;
    const muxPlaybackId = event.data.playback_ids?.[0]?.id;
    // Find the post by muxUploadId (which is the upload that generated this asset)
    const muxUploadId = event.data.upload_id;
    if (!muxUploadId || !muxPlaybackId) {
      return NextResponse.json({ error: 'Missing upload or playback ID' }, { status: 400 });
    }
    try {
      await connect();

      // Retry logic: poll for post up to 10 times with 2s delay
      async function findAndUpdatePostWithRetry(muxUploadId, muxPlaybackId, maxAttempts = 10, delayMs = 2000) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const post = await Post.findOneAndUpdate(
            { muxUploadId },
            { muxPlaybackId },
            { new: true }
          );
          if (post) return post;
          await new Promise(res => setTimeout(res, delayMs));
        }
        return null;
      }

      const post = await findAndUpdatePostWithRetry(muxUploadId, muxPlaybackId);
      if (!post) {
        return NextResponse.json({ error: 'No post found for muxUploadId after retrying' }, { status: 404 });
      }
      return NextResponse.json({ success: true, postId: post._id.toString(), muxPlaybackId });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  // Optionally handle other Mux events
  return NextResponse.json({ received: true });
}
