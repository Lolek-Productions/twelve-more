'use server'

import { connect } from "@/lib/mongodb/mongoose";
import { requireUser } from "@/lib/auth";
import Post from "@/lib/models/post.model";
import { notifyOnNewComment } from "@/lib/actions/post.js";

// Add a comment to a post (creates a new post with parentId)
export async function addCommentJSON(data) {
  const user = await requireUser();

  try {
    await connect();

    const { postId, comment, userMongoId, name, username, profileImg, organizationId } = data;

    // Validate the required fields
    if (!postId || !comment || !userMongoId) {
      return { success: false, message: 'Missing required fields' };
    }

    // Authentication check
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // Verify the parent post exists
    const parentPost = await Post.findById(postId);
    if (!parentPost) {
      return { success: false, message: 'Post not found' };
    }

    // Create a new post as a comment (with parentId)
    const newComment = await Post.create({
      text: comment,
      user: userMongoId,
      parentId: postId,
      profileImg,
      name,
      organization: organizationId || parentPost.organization, // Inherit organization from parent if not provided
      community: parentPost.community, // Inherit community from parent post
    });

    // Notify the parent post owner
    const commentData = {
      comment,
      user: userMongoId,
      name,
      username,
      profileImg,
    };

    await notifyOnNewComment(
      { id: postId, user: { _id: parentPost.user } },
      commentData
    );

    return {
      success: true,
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        text: newComment.text,
        user: userMongoId,
        createdAt: newComment.createdAt,
        profileImg
      }
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, message: error.message || 'Error adding comment' };
  }
}

// Get comments for a post
export async function getCommentsForPost(postId, limit = 5, page = 1) {
  const user = await requireUser();

  try {
    await connect();

    const skip = (page - 1) * limit;

    const comments = await Post.find({ parentId: postId })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName')
      .lean();

    const totalComments = await Post.countDocuments({ parentId: postId });

    return {
      success: true,
      comments: comments.map(comment => ({
        id: comment._id.toString(),
        text: comment.text,
        user: comment.user?._id.toString(),
        name: `${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`.trim(),
        profileImg: comment.profileImg,
        createdAt: comment.createdAt
      })),
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, message: error.message, comments: [] };
  }
}