import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';
import Community from '@/lib/models/community.model';
import Organization from '@/lib/models/organization.model';
import { connect } from '@/lib/mongodb/mongoose';

export const POST = async (req) => {
  console.log('getting post from api/post/get')
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

    // console.log('post post', post);

    const formattedPost = {
      id: post._id.toString(),
      text: post.text,
      image: post.image,
      user: {
        id: post.user?._id.toString(),
        firstName: post.user?.firstName,
        lastName: post.user?.lastName,
      },
      community: {
        id: post.community?._id.toString(),
        name: post.community?.name,
      },
      organization: {
        id: post.organization?._id.toString(),
        name: post.organization?.name,
      },
      profileImg: post.profileImg,
      comments: post.comments?.map((comment) => ({
        id: comment._id.toString(),
        comment: comment.comment,
        profileImg: comment.profileImg,
        createdAt: comment.createdAt,
        user: {
          id: comment.user?._id.toString(),
          firstName: comment.user?.firstName,
          lastName: comment.user?.lastName,
        },
      })) || [],
      likes: post.likes?.map((like) => ({
        id: like?._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    };

    // console.log('postid:', data.postId);

    return new Response(JSON.stringify(formattedPost), { status: 200 });
  } catch (error) {
    console.log('Error getting post:', error);
    return new Response('Error getting post', { status: 500 });
  }
};
