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

      // Respond quickly to Mux, do not block for retries
      (async () => {
        try {
          // Try once immediately
          let post = await Post.findOneAndUpdate(
            { muxUploadId },
            { muxPlaybackId },
            { new: true }
          );
          if (!post) {
            // Retry up to 4 more times with 2s delay (total ~8s), in the background
            for (let attempt = 0; attempt < 4; attempt++) {
              await new Promise(res => setTimeout(res, 2000));
              post = await Post.findOneAndUpdate(
                { muxUploadId },
                { muxPlaybackId },
                { new: true }
              );
              if (post) break;
            }
            if (!post) {
              console.error(`Mux webhook: No post found for muxUploadId ${muxUploadId} after background retries.`);
            }
          }
        } catch (err) {
          console.error('Mux webhook background update error:', err);
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
