'use server'

import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/post.model";
import User from '@/lib/models/user.model';
import twilioService from "@/lib/services/twilioService.js";
import {getPrivateUserById} from "@/lib/actions/user.js";
import {truncateText} from "@/lib/utils.js";
import {sendSMS} from "@/lib/actions/sms.js";
import {currentUser} from "@clerk/nextjs/server";
import {getCommunityById} from "@/lib/actions/community.js";
import {PUBLIC_APP_URL} from "@/lib/constants.js";

export async function createPost(postData) {
  const user = await currentUser();

  try {
    await connect();

    // Extract data from postData object
    const userId = postData.userId;
    const text = postData.text;
    const profileImg = postData.profileImg;
    const image = postData.image;
    const audio = postData.audio;
    const communityId = postData.communityId;
    const organizationId = postData.organizationId;
    const parentId = postData.parentId ?? null;

    if (!userId) {
      console.error('Warning: Missing userMongoId in publicMetadata');
      return { success: false, message: 'User Id missing' };
    }

    if (!user || user.publicMetadata.userMongoId !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    // Create and save in one operation
    const newPost = await Post.create({
      user: userId,
      text,
      profileImg,
      image,
      audio,
      community: communityId,
      organization: organizationId,
      parentId: parentId,
    });

    // If this is a comment (has parentId), notify the parent post owner
    if (parentId) {
      try {
        const parentPost = await Post.findById(parentId).populate('user');

        if (parentPost) {
          // Don't notify if commenting on your own post
          if (parentPost.user._id.toString() !== userId) {
            const commentData = {
              comment: text,
              user: userId,
            };

            // Notify the parent post owner about the new comment
            await notifyOnNewComment(
              { id: parentId, user: { _id: parentPost.user._id } },
              commentData
            );
          }
        }

        return { success: true, message: "Comment added successfully" };
      } catch (error) {
        console.error('Error handling comment notification:', error);
        return { success: true, message: "Comment added but notification failed" };
      }
    }

    // Continue with original community notification logic for new posts (not comments)
    if (communityId) {
      try {
        // Verify the community exists
        const communityResponse = await getCommunityById(communityId);
        if (!communityResponse.success) {
          console.log('Community not found:', communityId);
          return { success: true, message: "Community not found" };
        }

        // Access the community data correctly
        const community = communityResponse.community;

        // Find users who are members of this community
        const members = await User.find(
          { 'communities.community': communityId },
          { phoneNumber: 1, _id: 1 }
        ).lean();

        if (!members?.length) {
          console.log('No members found in community:', communityId);
          return { success: true, message: "No members found in community" };
        }

        // Filter out the current user and ensure valid phone numbers
        const otherMembersPhoneNumbers = members
          .filter((member) => member._id.toString() !== userId)
          .filter((member) => member.phoneNumber && typeof member.phoneNumber === 'string' && member.phoneNumber.trim() !== '')
          .map((member) => member.phoneNumber);

        if (!otherMembersPhoneNumbers.length) {
          console.log('No other members with valid phone numbers to notify in community:', communityId);
          return { success: true, message: "No other members with valid phone numbers to notify in community", notificationSent: false };
        }

        const truncatedText = truncateText(text, 150);

        const communityLink = `${PUBLIC_APP_URL}/communities/${communityId}/posts`;
        const messageBody = `New post: ${user.firstName} ${user.lastName}-${community.name}: "${truncatedText}" Check it out: ${communityLink}`;

        // Send batch SMS using Twilio Notify
        const batchResult = await twilioService.sendBatchSMS(otherMembersPhoneNumbers, messageBody);

        console.log('Community Notification Result:', {
          success: batchResult.success,
          message: batchResult.message,
          sid: batchResult.sid,
        });

        if (!batchResult.success) {
          console.error('Notification failed but post created:', batchResult.message);
          return { success: true, message: "Notification failed but post created" };
        }

        return { success: true, message: "Post Created"};
      } catch (error) {
        console.error('Error in community notification:', error);
        return { success: true, message: "Error in community notification" };
      }
    } else {
      console.log('No communityId provided, skipping notification');
      return { success: true, notificationSent: false };
    }
  } catch (error) {
    console.log('Error creating post:', error);
    return { success: false, message: error.message || 'Error creating post' };
  }
}

export async function getPostsForHomeFeed(limit = 10, appUser, offset = 0) {
  try {
    await connect();

    // Only fetch top-level posts (not comments)
    const posts = await Post.find(
      {
        parentId: null, // Only get top-level posts
        $or: [
          { organization: { $in: appUser.organizations.map(c => c.id) }, community: null },
          { community: { $in: appUser.communities.map(c => c.id) } }
        ]
      }
    )
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
      .sort({ createdAt: -1 })
      .limit(limit + 1) // Request one extra post to determine if there are more
      .skip(offset)
      .lean();

    // Check if we got more posts than the limit
    const hasMore = posts.length > limit;

    // Only return the requested number of posts
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      postsToReturn.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    const mappedPosts = postsWithCommentCounts.map((post) => ({
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
      commentCount: post.commentCount || 0, // Add comment count
      likes: post.likes?.map((like) => ({
        userId: like._id.toString(),
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));

    return { posts: mappedPosts, hasMore };
  } catch (error) {
    console.error("Error fetching posts by community ID:", error);
    return { posts: [], hasMore: false };
  }
}

export async function getPostsForCommunityFeed(limit = 10, appUser, communityId, offset = 0) {
  try {
    await connect();
    const posts = await Post.find(
      {
        community: communityId,
        parentId: null
      }, // Only get top-level posts
    )
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
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .skip(offset)
    .lean();

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = posts.slice(0, limit);

    if (!limitedPosts || limitedPosts.length === 0) {
      return { posts: [], hasMore: false }; // No posts found
    }

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      limitedPosts.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    const mappedPosts = postsWithCommentCounts.map((post) => ({
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
      commentCount: post.commentCount || 0, // Add comment count
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

export async function getPostsForOrganizationFeed(limit = 10, appUser, organizationId, offset = 0) {
  try {
    await connect();
    const posts = await Post.find(
      {
        organization: organizationId,
        community: null,
        parentId: null
      }, // Only get top-level posts
    )
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
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .skip(offset)
      .lean();

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = posts.slice(0, limit);

    if (!limitedPosts || limitedPosts.length === 0) {
      return { posts: [], hasMore: false }; // No posts found
    }

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      limitedPosts.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    const mappedPosts = postsWithCommentCounts.map((post) => ({
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
      commentCount: post.commentCount || 0, // Add comment count
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
    console.error("Error fetching posts by organization ID:", error);
    return [];
  }
}

export async function getAllPosts({limit = 10}) {
  try {
    await connect();

    const posts = await Post.find({ parentId: null }) // Only get top-level posts
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

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    return postsWithCommentCounts.map((post) => ({
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
      commentCount: post.commentCount || 0, // Add comment count
      likes: post.likes?.map((like) => ({
        id: like._id.toString(), //this is the id of the user
      })) || [],
      createdAt: post.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching posts by community ID:", error);
    return []; // Return empty array on error
  }
}

export async function getPostByIdWithComments(postId) {
  try {
    await connect();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    // Get the main post
    const post = await Post.findById(postId)
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

    // Get comments for this post
    const comments = await Post.find({ parentId: postId })
      .populate({
        path: 'user',
        select: 'firstName lastName',
      })
      .sort({ createdAt: 1 })
      .lean();

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
      comments: comments.map((comment) => ({
        id: comment._id.toString(),
        text: comment.text,
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

    return {success: true, post: postData};
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return null;
  }
}

export async function sayPrayerAction(post, appUser) {
  try {
    await connect();

    const existingPost = await Post.findById(post.id).populate('user');

    if (!existingPost) {
      console.log('Post not found');
      return { success: false, message: 'Post not found' };
    }

    const hasPrayed = existingPost.prayers.includes(appUser.id);

    const updateOperation = hasPrayed
      ? { $pull: { prayers: appUser.id } }
      : { $addToSet: { prayers: appUser.id } };

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

    if (!hasPrayed) {
      try {
        // Only send if this isn't the user's own post
        const phoneNumber = existingPost?.user?.phoneNumber;
        if (phoneNumber && existingPost.user._id.toString() !== appUser.id) {

          const message = `${appUser.firstName} ${appUser.lastName} is praying for you. ${PUBLIC_APP_URL}/posts/${existingPost._id.toString()}`
          // console.log(phoneNumber, message);

          await sendSMS({phoneNumber, message});
          // console.log('Prayer notification SMS sent to post creator');
        }
      } catch (notificationError) {
        console.error('Failed to send prayer notification:', notificationError);
        return { success: false, message: 'Failed to send prayer notification' };
      }
    }

    const actionMessage = hasPrayed
      ? 'Prayer removed successfully'
      : 'Message sent';

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

export async function getPostsByUserForAppUser(user, limit = 3, appUser, offset = 0) {
  try {
    await connect();

    if (!user || !appUser) {
      throw new Error("User and AppUser required");
    }

    // Ensure limit and offset are numbers
    limit = parseInt(limit);
    offset = parseInt(offset || 0);

    const appUserCommunityIds = appUser.communities
      .map(c => c.id);

    const userPublicOrMemberCommunityIds = user.communities.filter(c => {
      if(c.visibility === 'public') return true;
      return appUserCommunityIds.includes(c.id);
    }).map(c =>
      c.id
    );

    // First query to get the requested posts
    const query = {
      parentId: null, // Only get top-level posts
      user: user.id,   // Posts by the specified user
      $or: [
        // Case 1: Posts with no community, but in user's organizations
        {
          organization: { $in: appUser.organizations.map(c => c.id) },
          community: null
        },
        // Case 2: Posts in communities the user has access to
        {
          community: { $in: userPublicOrMemberCommunityIds }
        }
      ]
    };

    // Get posts for the current page
    const posts = await Post.find(query)
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
      .skip(offset)
      .limit(limit + 1) // Get one extra to check if there are more
      .sort({ createdAt: -1 })
      .lean();

    // Determine if there are more posts (if we got the extra one)
    const hasMore = posts.length > limit;

    // Remove the extra post if it exists
    const limitedPosts = hasMore ? posts.slice(0, limit) : posts;

    if (!limitedPosts || limitedPosts.length === 0) {
      return { success: true, posts: [], hasMore: false }; // No posts found
    }

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      limitedPosts.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    const mappedPosts = postsWithCommentCounts.map((post) => ({
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
      commentCount: post.commentCount || 0, // Add comment count
      likes: post.likes?.map((like) => ({
        userId: like._id?.toString(),
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));

    // Return success with posts and hasMore flag
    return {
      success: true,
      posts: mappedPosts,
      hasMore: hasMore
    };
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return { success: false, message: error.message, posts: [], hasMore: false };
  }
}

export async function getCommentsForPost(postId, limit = 20, page = 1) {
  try {
    await connect();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    const skip = (page - 1) * limit;

    const comments = await Post.find({ parentId: postId })
      .populate({
        path: 'user',
        select: 'firstName lastName profileImg',
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalComments = await Post.countDocuments({ parentId: postId });

    const mappedComments = comments.map(comment => ({
      id: comment._id.toString(),
      text: comment.text,
      user: {
        id: comment.user?._id.toString(),
        firstName: comment.user?.firstName,
        lastName: comment.user?.lastName,
      },
      profileImg: comment.profileImg || comment.user?.profileImg,
      createdAt: comment.createdAt,
    }));

    return {
      success: true,
      comments: mappedComments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    return {
      success: false,
      message: error.message,
      comments: []
    };
  }
}

export async function notifyOnNewComment(post, commentData) {
  // Make sure post and comment exist
  if (!post || !commentData) {
    console.error('Missing post or comment data for notification');
    return;
  }

  try {
    const response = await getPrivateUserById(post.user._id.toString());
    const postOwner = response.user;

    if (!postOwner) {
      console.error('no post owner found.');
      return { success: false, message: `No post owner found.` };
    }

    // Check if the commenter is the same as the post owner - exit if they're the same person
    if (commentData.user === postOwner.id) {
      console.log('Post owner commenting on their own post - skipping notification');
      return;
    }

    // If no phone number found, exit early
    if (!postOwner.phoneNumber) {
      console.error(`No phone number available for notification with ownerId ${postOwner.id}`);
      return;
    }

    const commenterResponse = await getPrivateUserById(commentData.user);
    const commenter = commenterResponse.user;

    const commenterName = `${commenter.firstName || ''} ${commenter.lastName || ''}`.trim();

    const truncatedComment = truncateText(commentData.comment, 150);

    const messageBody = `${commenterName} has commented on your post: "${truncatedComment}".    Check out the post here: ${PUBLIC_APP_URL}/posts/${post.id}`;

    const batchResult = await twilioService.sendSMS(postOwner.phoneNumber, messageBody);
    console.log('Notification sent successfully', batchResult);
    return batchResult;
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Optional: You could implement a retry mechanism or alternative notification method here
    throw error;
  }
}

export async function searchPosts(searchTerm, appUser, limit = 20) {
  const decodedSearchTerm = decodeURIComponent(searchTerm);

  try {
    await connect();

    const posts = await Post.find({
      $or: [
        {
          organization: { $in: appUser.organizations.map(c => c.id) },
          community: null,
          text: { $regex: decodedSearchTerm, $options: 'i' }
        },
        {
          community: { $in: appUser.communities.map(c => c.id) },
          organization: { $in: appUser.organizations.map(c => c.id) },
          text: { $regex: decodedSearchTerm, $options: 'i' }
        }
      ]
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
      .sort({ createdAt: -1 })
      .lean();

    if (!posts) {
      throw new Error("Posts not found");
    }

    // For each post, get the comment count
    const postsWithCommentCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Post.countDocuments({ parentId: post._id });
        return { ...post, commentCount };
      })
    );

    // Determine if there are more posts
    const hasMore = posts.length > limit;
    // Trim the extra post if it exists, returning only the requested limit
    const limitedPosts = postsWithCommentCounts.slice(0, limit);

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
      organization: {
        id: post.organization?._id.toString(),
        name: post.organization?.name,
      },
      profileImg: post.profileImg,
      commentCount: post.commentCount || 0, // Add comment count
      likes: post.likes?.map((like) => ({
        userId: like._id?.toString(),
      })) || [],
      prayers: post.prayers?.map((prayer) => ({
        userId: prayer._id.toString(),
      })) || [],
      createdAt: post.createdAt,
    }));


    return {success: true, posts: mappedPosts};
  } catch (err) {
    console.log(err);
    return {success: false, message: `Error searching posts: ${err.message}` };
  }
};