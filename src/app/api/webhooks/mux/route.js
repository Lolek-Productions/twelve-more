import { NextResponse } from 'next/server';
import Post from '@/lib/models/post.model';
import { connect } from '@/lib/mongodb/mongoose';

export async function POST(req) {
  let event;
  try {
    event = await req.json();
    console.log(`[${new Date().toISOString()}] Mux webhook: Incoming event:`, JSON.stringify(event));
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
      console.error('Mux webhook: Missing upload or playback ID:', event);
      return NextResponse.json({ error: 'Missing upload or playback ID' }, { status: 400 });
    }
    try {
      console.log(`[${new Date().toISOString()}] Mux webhook: Attempting DB connect`);
      await connect();
      console.log(`[${new Date().toISOString()}] Mux webhook: DB connected`);

      // Synchronously retry up to 4 times (1s delay) before responding
      let post = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        console.log(`[${new Date().toISOString()}] Mux webhook attempt #${attempt+1}: Looking for post with muxUploadId: ${muxUploadId}, Setting muxPlaybackId: ${muxPlaybackId}`);
        post = await Post.findOneAndUpdate(
          { muxUploadId },
          { $set: { muxPlaybackId } },
          { new: true }
        );
        if (post) {
          console.log(`[${new Date().toISOString()}] Mux webhook: Post found and updated:`, post._id?.toString?.() || post);
          break;
        } else {
          console.log(`[${new Date().toISOString()}] Mux webhook: No post found for muxUploadId: ${muxUploadId} on attempt #${attempt+1}`);
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      if (!post) {
        console.error(`[${new Date().toISOString()}] Mux webhook: No post found for muxUploadId ${muxUploadId} after all retries.`);
      }
      return NextResponse.json({ received: true });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  // Optionally handle other Mux events
  return NextResponse.json({ received: true });
}
