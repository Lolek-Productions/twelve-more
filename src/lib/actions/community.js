"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import User from '../models/user.model';
import { connect } from '../mongodb/mongoose';
import { clerkClient } from '@clerk/nextjs/server';

export async function createCommunity(formData, user) {
  if (!user) return { error: "User is required." };

  try {
    const name = formData.name?.trim();
    const purpose = formData.purpose?.trim();
    const visibility = formData.visibility?.trim();

    if (!name) return { error: "Community name is required." };
    if (!purpose) return { error: "Purpose is required." };
    if (!visibility) return { error: "Visibility is required." };

    await connect();

    // console.log("Creating a new community:", name);

    const newCommunity = await Community.create({
      name,
      purpose,
      visibility,
      createdBy: user.id,
      organization: user.selectedOrganization.id,
    });

    console.log('newCommunity', newCommunity);

    await User.findOneAndUpdate(
      { _id: user.id },
      { $addToSet: { communities: { community: newCommunity._id, role: "leader" } } } // Add as leader
    );

    return {
      success: true,
      message: "Community created successfully!",
      community: {
        id: newCommunity._id.toString(),
        name: newCommunity.name,
        purpose: newCommunity.purpose,
        visibility: newCommunity.visibility,
      },
    };
  } catch (error) {
    console.error("Error creating community:", error);
    return { success: false, error: "Failed to create community." };
  }
}

export const deleteCommunity = async (id) => {
  try {
    await connect();

    if (!id) {
      return { error: "Community ID is required to delete." };
    }

    // Step 1: Delete the community from the Community collection
    const deletedCommunity = await Community.findByIdAndDelete(id);

    if (!deletedCommunity) {
      return { error: "Community not found or already deleted." };
    }

    // Step 2: Remove the community from all users who were members
    await User.updateMany(
      { "communities.community": id },
      { $pull: { communities: { community: id } } }
    );

    return { success: true, message: "Community deleted successfully!" };
  } catch (error) {
    console.error("Error deleting community:", error);
    return { success: false, error: "Failed to delete community." };
  }
};

export const getCommunitiesByOrganization = async function (organizationId, user = null) {
  try {
    console.log(organizationId);
    await connect(); // Ensure database connection (assuming this is your MongoDB connection function)

    const userCommunityIds = user?.communities.map((c) => {
      return c.id
    }) || [];
    // console.log(userCommunityIds);

    const communities = await Community.find({
      $or: [
        {
          organization: organizationId,
          visibility: "public"
        },
        {
          _id: {$in: userCommunityIds}
        }
      ]
    })
    .populate({
      path: "organization", // Field to populate
      select: "name", // Only fetch firstName and lastName
    })
    .lean();

    return communities.map((community) => ({
      id: community._id?.toString() || "",
      name: community.name,
      purpose: community.purpose,
      visibility: community.visibility,
      organization: { name: community.organization?.name || "Unknown Organization" }, // Optional: Include organizationName if available in your schema
    }));
  } catch (error) {
    console.error("Error fetching communities by organization:", error);
    return []; // Return an empty array if an error occurs
  }
};

export const getCommunityById = async function (communityId) {
  // console.log('communityId', communityId);

  try {
    await connect();

    const community = await Community.findById(communityId)
      .lean();

    if (!community) {
      console.error("No community found for ID:", communityId);
      return null;
    }

    return {
      id: community._id?.toString() || "",
      name: community.name,
      purpose: community.purpose,
      visibility: community.visibility,
      organization: {
        name: community.organization?.name || "Unknown Organization",
        id: community.organization?._id?.toString() || "",
      },
    };
  } catch (error) {
    console.error("Error fetching community by ID:", error);
    return null;
  }
};

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

export async function searchCommunities(query) {
  try {
    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return {
        success: false,
        error: "Query must be a string with at least 2 characters",
      };
    }

    await connect(); // Ensure database connection

    // Create a case-insensitive regex for the query
    const regex = new RegExp(query.trim(), "i");

    // Search users by firstName or lastName
    const communities = await Community.find({
        $or: [
          { name: { $regex: regex } },
        ],
      })
      .select("name") // Fetch only needed fields
      .limit(10) // Limit results for performance
      .lean(); // Return plain JS objects

    // Map results to the expected format
    const formattedCommunities = communities.map((community) => ({
      id: community._id.toString(),
      name: `${community.name}`.trim(),
    }));

    return {
      success: true,
      data: formattedCommunities,
    };
  } catch (error) {
    console.error("Error searching communities:", error);
    return {
      success: false,
      error: "Failed to search communities",
    };
  }
}

export const getAllCommunities = async function () {
  try {
    await connect();

    const communities = await Community.find()
      .populate({
        path: "organization", // Field to populate
        select: "name", // Only fetch firstName and lastName
      })
      .lean();

    return communities.map((community) => ({
      id: community._id?.toString() || "",
      name: community.name,
      purpose: community.purpose,
      visibility: community.visibility,
      organization: { name: community.organization?.name || "Unknown Organization" },
    }));
  } catch (error) {
    console.error("Error fetching communities by organization:", error);
    return [];
  }
};

export async function updateCommunity(formData) {
  if (!formData.id) return { error: "Community ID is required." };

  try {
    const id = formData.id;
    const name = formData.name?.trim();
    const purpose = formData.purpose?.trim();
    const visibility = formData.visibility?.trim();

    if (!name) return { error: "Community name is required." };
    if (!purpose) return { error: "Purpose is required." };
    if (!visibility) return { error: "Visibility is required." };

    await connect();

    // console.log("Creating a new community:", name);

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      {
        name,
        purpose,
        visibility,
      },
      { new: true }
    );

    console.log('updatedCommunity', updatedCommunity);

    // await User.findOneAndUpdate(
    //   { _id: user.id },
    //   { $addToSet: { communities: { community: newCommunity._id, role: "leader" } } } // Add as leader
    // );

    return {
      success: true,
      message: "Community created successfully!",
      community: {
        id: updatedCommunity._id.toString(),
        name: updatedCommunity.name,
        purpose: updatedCommunity.purpose,
        visibility: updatedCommunity.visibility,
      },
    };
  } catch (error) {
    console.error("Error creating community:", error);
    return { success: false, error: "Failed to create community." };
  }
}