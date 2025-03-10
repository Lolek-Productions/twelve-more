import Post from '@/lib/models/post.model';
import { connect } from '@/lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';
import {notifyOnNewComment} from "@/lib/actions/post.js";

export const PUT = async (req) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    const post = await Post.findById(data.postId);
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      data.postId,
      {
        $push: {
          comments: {
            comment: data.comment,
            user: data.user,
            name: data.name,
            username: data.username,
            profileImg: data.profileImg,
          },
        },
      },
      { new: true }
    );

    //Notify the owner of the post when a comment has been made
    await notifyOnNewComment(updatedPost, data);

    return new Response(JSON.stringify(updatedPost), { status: 200 });
  } catch (error) {
    console.log('Error adding a comment to a post:', error);
    return new Response('Error adding a comment to a post', { status: 500 });
  }
};
