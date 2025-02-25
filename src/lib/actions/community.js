"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import { connect } from '../mongodb/mongoose';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

export async function createCommunity({ name, organizationId }) {
  if (!name) {
    return { error: "Community name is required." };
  }

  if (!organizationId) {
    return { error: "Organization ID is required." };
  }

  try {
    await connect(); // Ensure database connection

    console.log("Creating a new community:", name);

    const newCommunity = await Community.create({
      name: name.trim(), // Clean up whitespace
      organization: organizationId, // Use organizationId instead of hardcoded value
    });

    return {
      success: "Community created successfully!",
      community: {
        id: newCommunity._id.toString(),
        name: newCommunity.name,
        organization: newCommunity.organization.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating community:", error);
    return { error: "Failed to create community." };
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

    const communities = await Community.find()
      .populate({
        path: "members", // Field to populate
        select: "firstName lastName", // Only fetch firstName and lastName
      })
      .lean();
    return communities.map((community) => ({
      id: community._id?.toString() || "",
      name: community.name,
      members: community.members?.map((member) => ({
        userId: member._id.toString(), // Convert ObjectId to string
        firstName: member.firstName || "",
        lastName: member.lastName || "",
      })) || [],
      leaders: community.leaders?.map(leader => leader.toString()) || [],
      organization: community.organization?.toString() || null,
    }));

  } catch (error) {
    console.error("Error fetching communities:", error);
    return []; // ✅ Return an empty array if an error occurs
  }
};

export const getCommunitiesByOrganization = async function (organizationId) {
  try {
    console.log(organizationId);
    await connect(); // Ensure database connection (assuming this is your MongoDB connection function)

    const communities = await Community.find({ organization: organizationId })
      .populate({
        path: "members", // Field to populate
        select: "firstName lastName", // Only fetch firstName and lastName
      })
      .populate({
        path: "organization", // Field to populate
        select: "name", // Only fetch firstName and lastName
      })
      .lean();

    return communities.map((community) => ({
      id: community._id?.toString() || "",
      name: community.name,
      members: community.members?.map((member) => ({
        userId: member._id.toString(), // Convert ObjectId to string
        firstName: member.firstName || "",
        lastName: member.lastName || "",
      })) || [],
      leaders: community.leaders?.map((member) => ({
        userId: member._id.toString(), // Convert ObjectId to string
        firstName: member.firstName || "",
        lastName: member.lastName || "",
      })) || [],
      // organization: community.organization?.toString() || null,
      organization: { name: community.organization?.name || "Unknown Organization" }, // Optional: Include organizationName if available in your schema
    }));
  } catch (error) {
    console.error("Error fetching communities by organization:", error);
    return []; // Return an empty array if an error occurs
  }
};

export const getCommunityById = async function (communityId) {
  try {
    await connect(); // Ensure database connection

    const community = await Community.findById(communityId)
      .populate({
        path: "members",
        select: "firstName lastName",
      })
      .populate({
        path: "leaders",
        select: "firstName lastName",
      })
      .lean();

    if (!community) {
      console.error("No community found for ID:", communityId);
      return null;
    }

    return {
      id: community._id?.toString() || "",
      name: community.name,
      members: community.members?.map((member) => ({
        userId: member._id.toString(),
        firstName: member.firstName || "",
        lastName: member.lastName || "",
      })) || [],
      leaders: community.leaders?.map((member) => ({
        userId: member._id.toString(),
        firstName: member.firstName || "",
        lastName: member.lastName || "",
      })) || [],
      organization: community.organization?.toString() || null,
      organizationName: community.organizationName || "Unknown Organization",
    };
  } catch (error) {
    console.error("Error fetching community by ID:", error);
    return null;
  }
};

export async function removeUserFromCommunity(communityId, userId) {
  console.log(communityId, userId);
  return;

  try {
    // Input validation
    if (!communityId || !mongoose.isValidObjectId(communityId)) {
      return {
        success: false,
        error: "Invalid or missing community ID",
      };
    }
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return {
        success: false,
        error: "Invalid or missing user ID",
      };
    }

    await connect(); // Ensure database connection

    // Convert string IDs to ObjectId
    const communityObjectId = new mongoose.Types.ObjectId(communityId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Update the community by pulling the userId from members array
    const result = await Community.updateOne(
      { _id: communityObjectId },
      { $pull: { members: userObjectId } }
    );

    // Check if the operation modified anything
    if (result.modifiedCount === 0) {
      return {
        success: false,
        error: "User not found in community or community does not exist",
      };
    }

    return {
      success: true,
      message: "User removed from community",
    };
  } catch (error) {
    console.error("Error removing user from community:", error);
    return {
      success: false,
      error: "Failed to remove user from community",
    };
  }
}

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