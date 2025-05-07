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

      // Respond quickly to Mux, do not block for retries
      (async () => {
        try {
          // Try once immediately
          console.log(`[${new Date().toISOString()}] Mux webhook: Looking for post with muxUploadId: ${muxUploadId}, Setting muxPlaybackId: ${muxPlaybackId}`);
          let post = await Post.findOneAndUpdate(
            { muxUploadId },
            { $set: { muxPlaybackId } },
            { new: true }
          );
          if (post) {
            console.log(`[${new Date().toISOString()}] Mux webhook: Post found and updated:`, post._id?.toString?.() || post);
          } else {
            console.log(`[${new Date().toISOString()}] Mux webhook: No post found for muxUploadId: ${muxUploadId} on initial attempt.`);
          }
          if (!post) {
            // Retry up to 8 more times with 3s delay (total ~24s), in the background
            for (let attempt = 0; attempt < 8; attempt++) {
              await new Promise(res => setTimeout(res, 3000));
              console.log(`[${new Date().toISOString()}] Mux webhook retry #${attempt+1}: Looking for post with muxUploadId: ${muxUploadId}, Setting muxPlaybackId: ${muxPlaybackId}`);
              post = await Post.findOneAndUpdate(
                { muxUploadId },
                { $set: { muxPlaybackId } },
                { new: true }
              );
              if (post) {
                console.log(`[${new Date().toISOString()}] Mux webhook retry #${attempt+1}: Post found and updated:`, post._id?.toString?.() || post);
                break;
              } else {
                console.log(`[${new Date().toISOString()}] Mux webhook retry #${attempt+1}: No post found for muxUploadId: ${muxUploadId}`);
              }
            }
            if (!post) {
              console.error(`[${new Date().toISOString()}] Mux webhook: No post found for muxUploadId ${muxUploadId} after background retries.`);
            }
          }
        } catch (err) {
          console.error(`[${new Date().toISOString()}] Mux webhook background update error:`, err.stack || err);
        }
      })();
      // Always respond quickly to Mux
      return NextResponse.json({ received: true });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  // Optionally handle other Mux events
  return NextResponse.json({ received: true });
}
