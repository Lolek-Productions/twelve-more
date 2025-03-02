'use server'

import { connect } from "@/lib/mongodb/mongoose"; // Adjust to your MongoDB connection path
import Post from "@/lib/models/post.model"; // Adjust to your Post model path
import User from '@/lib/models/user.model';

export async function getPosts({limit = 10, selectedOrganizationId, communityId}) {
  try {
    console.log(selectedOrganizationId);

    await connect();
    const query = {
      ...(communityId && { community: communityId }),
      ...(selectedOrganizationId && { organization: selectedOrganizationId })
    };
    const posts = await Post.find(query)
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
        select: 'firstName lastName',
      })
      .lean();

    if (!post) {
      throw new Error("Post not found");
    }

    return {
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
        id: like._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    };
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return null;
  }
}