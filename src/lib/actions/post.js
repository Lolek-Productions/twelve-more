'use server'

import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/post.model";
import User from '@/lib/models/user.model';
import twilioService from "@/lib/services/twilioService.js";
import {getPrivateUserById} from "@/lib/actions/user.js";
import {truncateText} from "@/lib/utils.js";  //Keep even though WebStorm doesn't think it is being used!!!

export async function getPostsForHomeFeed(limit = 10, user) {
  try {
    await connect();

    //Get the posts where the communityId is null OR get the posts where the communityId matches the users selected organization and where the user is a member of that community.
    const posts = await Post.find(
      {
        $or: [
          { organization: user.selectedOrganization.id, community: null },  // Get posts without a community
          {
            community: { $in: user.communities.map(c => c.id) }, // Posts from communities user belongs to
            organization: user.selectedOrganization.id // Within the selected organization
          }
        ]
      }
    )
    .populate({
      path: "comments",
      select: "text author createdAt",
    })
    .populate({
      path: 'community',
      select: 'name',
    })
    .populate({
      path: 'user',
      select: 'firstName lastName',
    })
    .populate({
      path: 'likes',
    })
    .populate({
      path: 'prayers.user',
    })
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = posts.slice(0, limit);

    if (!limitedPosts || limitedPosts.length === 0) {
      return { posts: [], hasMore: false }; // No posts found
    }

    const mappedPosts = limitedPosts.map((post) => ({
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
      profileImg: post.profileImg,
      comments: post.comments?.map((comment) => ({
        id: comment._id.toString(),
        text: comment.text,
        author: comment.author,
        createdAt: comment.createdAt,
        user: {
          id: comment.user?._id.toString(),
          firstName: comment.user?.firstName,
          lastName: comment.user?.lastName,
        },
      })) || [],
      likes: post.likes?.map((like) => ({
        userId: like._id.toString(), //this is the id of the user
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));

    return { posts: mappedPosts, hasMore }
  } catch (error) {
    console.error("Error fetching posts by community ID:", error);
    return [];
  }
}

export async function getPostsForCommunityFeed(limit = 10, user, communityId) {

  try {
    // console.log(selectedOrganizationId);
    // console.log(';lkj;kljk');

    await connect();
    const posts = await Post.find(
        { community: communityId },
      )
      .populate({
        path: "comments",
        select: "text author createdAt",
      })
      .populate({
        path: 'community',
        select: 'name',
      })
      .populate({
        path: 'user',
        select: 'firstName lastName',
      })
      .populate({
        path: 'likes',
      })
      .populate({
        path: 'prayers.user',
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = posts.slice(0, limit);

    if (!limitedPosts || limitedPosts.length === 0) {
      return { posts: [], hasMore: false }; // No posts found
    }

    const mappedPosts = limitedPosts.map((post) => ({
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
      profileImg: post.profileImg,
      comments: post.comments?.map((comment) => ({
        id: comment._id.toString(),
        text: comment.text,
        author: comment.author,
        createdAt: comment.createdAt,
        user: {
          id: comment.user?._id.toString(),
          firstName: comment.user?.firstName,
          lastName: comment.user?.lastName,
        },
      })) || [],
      likes: post.likes?.map((like) => ({
        userId: like._id.toString(), //this is the id of the user
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));

    return { posts: mappedPosts, hasMore }
  } catch (error) {
    console.error("Error fetching posts by community ID:", error);
    return [];
  }
}

export async function getAllPosts({limit = 10}) {
  try {
    await connect();

    const posts = await Post.find() // Query posts by communityId
      .populate({
        path: "comments",
        select: "text author createdAt",
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
        path: 'user',
        select: 'firstName lastName',
      })
      .populate({
        path: 'likes',
        select: 'firstName lastName',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!posts || posts.length === 0) {
      return []; // No posts found
    }

    return posts.map((post) => ({
      id: post._id.toString(),
      text: post.text,
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
        text: comment.text,
        author: comment.author,
        createdAt: comment.createdAt,
        user: {
          id: comment.user?._id.toString(),
          firstName: comment.user?.firstName,
          lastName: comment.user?.lastName,
        },
      })) || [],
      likes: post.likes?.map((like) => ({
        id: like._id.toString(), //this is the id of the user
      })) || [],
      createdAt: post.createdAt,
      // Add other fields like author, createdAt if present
    }));
  } catch (error) {
    console.error("Error fetching posts by community ID:", error);
    return []; // Return empty array on error
  }
}

export async function getPostById(postId) {
  try {
    await connect();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    const post = await Post.findById(postId)
      .populate({
        path: "comments",
        select: "comment profileImg createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
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
        path: 'user',
        select: 'firstName lastName',
      })
      .populate({
        path: 'likes',
      })
      .populate({
        path: 'prayers.user',
      })
      .lean();

    if (!post) {
      throw new Error("Post not found");
    }

    // console.log('post - post.js', post);

    const postData = {
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
        userId: like._id?.toString(),
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    };

    // console.log('postData Result', postData.prayers);
    // console.log('postData Result', JSON.stringify(post.prayers, null, 2));

    return postData;
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return null;
  }
}

export async function sayPrayerAction(post, user) {
  console.log('hello sayPrayer');
  console.log('post.id', post.id, 'user.id', user.id);

  try {
    await connect();

    const existingPost = await Post.findById(post.id);

    if (!existingPost) {
      console.log('Post not found');
      return { success: false, message: 'Post not found' };
    }

    const hasPrayed = existingPost.prayers.includes(user.id);

    const updateOperation = hasPrayed
      ? { $pull: { prayers: user.id } }
      : { $addToSet: { prayers: user.id } };

    const updatedPost = await Post.findByIdAndUpdate(
      post.id,
      updateOperation,
      {
        new: true,
      }
    );

    if (!updatedPost) {
      console.log('Failed to update post');
      return { success: false, message: 'Failed to update post' };
    }

    const actionMessage = hasPrayed
      ? 'Prayer removed successfully'
      : 'Prayer added successfully';
    console.log(actionMessage);

    return {
      success: true,
      message: actionMessage,
      prayers: updatedPost.prayers?.map((prayer) => ({
        userId: prayer._id.toString(), // Assigning the converted `_id` to a key
      })) || [],
    };

  } catch (error) {
    console.error("Error updating prayer for post:", error.message);
    return {
      status: false,
      message: 'Error updating prayer: ' + error.message
    };
  }
}

export async function setUserLikesAction(post, user) {
  console.log('hello setUserLikesAction');
  // console.log('post.id', post.id, 'user.id', user.id);

  try {
    await connect();

    const existingPost = await Post.findById(post.id);

    if (!existingPost) {
      console.log('Post not found');
      return { success: false, message: 'Post not found' };
    }

    const hasLiked = existingPost.likes.includes(user.id);

    const updateOperation = hasLiked
      ? { $pull: { likes: user.id } }
      : { $addToSet: { likes: user.id } };

    const updatedPost = await Post.findByIdAndUpdate(
      post.id,
      updateOperation,
      {
        new: true,
      }
    );

    if (!updatedPost) {
      console.log('Failed to update post');
      return { success: false, message: 'Failed to update post' };
    }

    const actionMessage = hasLiked
      ? 'Like removed successfully'
      : 'Like added successfully';
    console.log(actionMessage);

    return {
      success: true,
      message: actionMessage,
      likes: updatedPost.likes?.map((like) => ({
        userId: like._id.toString(),
      })) || [],
    };

  } catch (error) {
    console.error("Error updating like for post:", error.message);
    return {
      status: false,
      message: 'Error updating like: ' + error.message
    };
  }
}

export async function getPostsByUserId(userId, limit) {
  try {
    await connect();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const posts = await Post.find({user: userId})
      .populate({
        path: "comments",
        select: "comment profileImg createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
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
        path: 'user',
        select: 'firstName lastName',
      })
      .populate({
        path: 'likes',
      })
      .populate({
        path: 'prayers.user',
      })
      .limit(limit)
      .lean();

    if (!posts) {
      throw new Error("Posts not found");
    }

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = posts.slice(0, limit);

    if (!limitedPosts || limitedPosts.length === 0) {
      return { posts: [], hasMore: false }; // No posts found
    }

    // console.log('-----post - post.js', posts);

    const mappedPosts = posts.map((post) => ({
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
        userId: like._id?.toString(),
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));

    return {success: true, posts: mappedPosts, hasMore};
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return null;
  }
}

export async function notifyOnNewComment(post, commentData) {
  // console.error('post', post, 'commentData', commentData);

  // Make sure post and comment exist
  if (!post || !commentData) {
    console.error('Missing post or comment data for notification');
    return;
  }

  try {
    const postOwner = await getPrivateUserById(post.user.id);

    if (!postOwner) {
      return { success: false, message: `No post owner found.` };
    }

    // If no phone number found, exit early
    if (!postOwner.phoneNumber) {
      console.log('No phone number available for notification');
      return;
    }

    // Check if the commenter is the same as the post owner - exit if they're the same person
    if (commentData.user.id === postOwner.id) {
      console.log('Post owner commenting on their own post - skipping notification');
      return;
    }

    const commenterName = `${commentData.user.firstName || ''} ${commentData.user.lastName || ''}`.trim();

    const truncatedComment = truncateText(commentData.comment, 50);

    // Create the message text
    const messageBody = `${commenterName} has commented on your post: "${truncatedComment}"  Check out the post here: https://twelvemore.social/posts/${post.id}`;

    // Send the SMS
    const batchResult = await twilioService.sendSMS(postOwner.phoneNumber, messageBody);
    console.log('Notification sent successfully', batchResult);
    return batchResult;
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Optional: You could implement a retry mechanism or alternative notification method here
    throw error;
  }
}