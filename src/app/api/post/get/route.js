import Post from '../../../../lib/models/post.model';
import { connect } from '../../../../lib/mongodb/mongoose';

export const POST = async (req) => {
  try {
    await connect();
    const data = await req.json();
    const post = await Post.findById(data.postId)
      .populate({
        path: 'user',
        select: 'firstName lastName',
      })
      .populate({
        path: 'community',
        select: 'name',
      })
      .populate({
        path: 'organization',
        select: 'name',
      })
      .populate({
        path: "comments",
        select: "comment profileImg createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      });


    console.log('postid:', data.postId);


    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.log('Error getting post:', error);
    return new Response('Error getting post', { status: 500 });
  }
};
