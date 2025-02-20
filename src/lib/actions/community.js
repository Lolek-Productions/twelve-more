"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import { connect } from '../mongodb/mongoose';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

export async function createOrUpdateCommunity(formData) {
  console.log('hello createOrUpdateCommunity:', formData);

  const { id, name } = formData;
  const organization = 1;

  if (!name) {
    return { error: "Community name is required." };
  }

  try {
    await connect();

    if (id) {
      // ✅ If `id` exists, update the existing community
      const community = await Community.findByIdAndUpdate(
        id,
        { $set: {
          name,
          // organization,
        } },
        { new: true }
      );

      if (!community) {
        return { error: "Community not found." };
      }

      return { success: "Community updated successfully!" };
    } else {
      console.log('Creating a new community');

      const newCommunity = await Community.create({
        name,
        // organization,
      });
      return { success: "Community created successfully!" };
    }
  } catch (error) {
    console.log(error);
    return { error: "Failed to save community." };
  }
}

export const deleteCommunity = async (id) => {
  try {
    await connect();

    if (!id) {
      return { error: "Community ID is required to delete." };
    }

    await Community.findByIdAndDelete(new mongoose.Types.ObjectId(id));

    return { success: "Community deleted successfully!" };
  } catch (error) {
    console.error("Error deleting community:", error);
    return { error: "Failed to delete community." };
  }
};

export const getCommunities = async function () {
  try {
    await connect(); // ✅ Ensure database connection

    const communities = await Community.find().lean();
    return communities.map((community) => ({
      id: community._id?.toString() || "",
      name: community.name,
      members: community.members?.map(member => member.toString()) || [],
      leaders: community.leaders?.map(leader => leader.toString()) || [],
      organization: community.organization?.toString() || null,
    }));

  } catch (error) {
    console.error("Error fetching communities:", error);
    return []; // ✅ Return an empty array if an error occurs
  }
};


export async function getUserCommunities() {
  try {
    // Connect to MongoDB
    await connect();

    // Get the current user from Clerk
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!user.publicMetadata.userMongoId) {
      throw new Error('User missing userMongoId');
    }

    // Fetch communities where this user is a member
    const communities = await Community.find({ members: user.publicMetadata.userMongoId }).lean();

    return {
      success: true,
      communities: communities.map((community) => ({
        id: community._id.toString(),
        name: community.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching communities:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ./lib/actions/community.js
export async function addUserToCommunity(communityId, userId) {
  // console.log(communityId, userId);

  try {
    await connect();

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return { success: false, error: 'Invalid community ID' };
    }
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'Invalid user ID' };
    }

    const client = await clerkClient();

    // Check if user exists in Clerk
    // const users = await client.users.getUserList({ userId: [userId] });
    // console.log(users);
    //
    // if (!users.data.length) {
    //   return { success: false, error: 'User not found in Clerk' };
    // }

    // Update community by adding userId to members
    const community = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } }, // $addToSet prevents duplicates
      { new: true }
    ).lean();

    if (!community) {
      return { success: false, error: 'Community not found' };
    }

    return { success: true, message: `User added to community` };
  } catch (error) {
    console.error('Error adding user to community:', error.message);
    return { success: false, error: 'Failed to add user to community' };
  }
}