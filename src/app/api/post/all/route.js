import Post from '@/lib/models/post.model.js';
import { connect } from '@/lib/mongodb/mongoose';


export const POST = async (req) => {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 5; // Default to 5 posts

    const feedPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(limit); // ✅ Apply dynamic limit

    return new Response(JSON.stringify(feedPosts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    return new Response('Error getting posts', {
      status: 500,
    });
  }
};