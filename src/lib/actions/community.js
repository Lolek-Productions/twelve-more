"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import User from '../models/user.model';
import { connect } from '../mongodb/mongoose';
import { clerkClient } from '@clerk/nextjs/server';
import {removeCommunitiesFromAllUsers} from "@/lib/actions/user.js";

/**
 * Creates a new community
 */
export async function createCommunity(data) {

  try {
    const name = data.name?.trim();
    const purpose = data.purpose?.trim();
    const visibility = data.visibility?.trim() ?? 'public';
    const userId = data.userId?.trim();
    const organizationId = data.organizationId?.trim();

    if (!name) return { success: false, message: "Community name is required." };
    if (!organizationId) return { success: false, message: "Organization ID is required." };

    await connect();

    const newCommunity = await Community.create({
      name,
      purpose,
      visibility,
      createdBy: userId,
      organization: organizationId,
    });

    // Add user as a leader of the community
    await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { communities: { community: newCommunity._id, role: "leader" } } }
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
    return { success: false, message: "Failed to create community." };
  }
}


/**
 * Deletes one or more communities and removes their references from all users
 * @param {string|string[]} ids - Single community ID or array of community IDs to delete
 * @returns {Object} Result object with success status and message
 */
export const deleteCommunities = async (ids) => {
  try {
    await connect();

    // Validate input
    if (!ids) {
      return {success: false, message: "Community ID(s) are required to delete."};
    }

    // Convert to array if a single ID is provided
    const communityIds = Array.isArray(ids) ? ids : [ids];

    if (communityIds.length === 0) {
      return {success: false, message: "At least one community ID is required."};
    }

    // Delete the communities
    const deleteResult = await Community.deleteMany({_id: {$in: communityIds}});

    if (deleteResult.deletedCount === 0) {
      return {success: false, message: "No communities found or already deleted."};
    }

    // Remove references to these communities from all users
    await removeCommunitiesFromAllUsers(communityIds);

    return {
      success: true,
      message: `${deleteResult.deletedCount} ${deleteResult.deletedCount === 1 ? 'community' : 'communities'} deleted successfully!`,
      deletedCount: deleteResult.deletedCount
    };
  } catch (error) {
    console.error("Error deleting communities:", error);
    return {success: false, message: "Failed to delete communities."};
  }
}

/**
 * Gets all communities for an organization
 */
export const getCommunitiesByOrganization = async function (organizationId) {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization ID is required." };
    }

    await connect();

    const communitiesData = await Community.find({
      $or: [
        {
          organization: organizationId,
        },
      ]
    })
      .populate({
        path: "organization",
        select: "name",
      })
      .lean();

    return {
      success: true,
      communities: communitiesData.map((community) => ({
          id: community._id?.toString() || "",
          name: community.name,
          purpose: community.purpose,
          visibility: community.visibility,
          organization: {name: community.organization?.name || "Unknown Organization"},
        }))
      }
  } catch (error) {
    console.error("Error fetching communities by organization:", error);
    return [];
  }
};

export const getCommunitiesByOrganizationForUser = async function (organizationId, appUser) {
  try {
    if (!organizationId) {
      return { success: false, message: "Organization ID is required." };
    }

    await connect();

    const userCommunityIds = appUser?.communities.map(c => c.id) || [];

    const communitiesData = await Community.find({
      $or: [
        {
          organization: organizationId,
          visibility: "public"
        },
        {
          organization: organizationId,
          _id: { $in: userCommunityIds }
        }
      ]
    })
      .populate({
        path: "organization",
        select: "name",
      })
      .lean();

    return {
      success: true,
      communities: communitiesData.map((community) => ({
        id: community._id?.toString() || "",
        name: community.name,
        purpose: community.purpose,
        visibility: community.visibility,
        organization: {name: community.organization?.name || "Unknown Organization"},
      }))
    }
  } catch (error) {
    console.error("Error fetching communities by organization:", error);
    return [];
  }
};

export const getCommunitiesByUser = async function (appUser) {
  if (!appUser) {return;}

  try {
    await connect();

    const userCommunityIds = appUser.communities.map(c => c.id) || [];
    const userOrganizationIds = appUser.organizations.map(c => c.id) || [];

    const communities = await Community.find({
      $or: [
        {
          organization: { $in: userOrganizationIds },
          visibility: "public"
        },
        {
          _id: { $in: userCommunityIds }
        }
      ]
    })
      .populate({
        path: "organization",
        select: "name",
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

/**
 * Gets a community by ID
 */
export const getCommunityById = async function (communityId) {
  try {
    if (!communityId) {
      return { success: false, message: "Community ID is required." };
    }

    await connect();

    const community = await Community.findById(communityId).lean();

    if (!community) {
      return { success: false, message: "Community not found." };
    }

    return {
      success: true,
      community: {
        id: community._id?.toString() || "",
        name: community.name,
        purpose: community.purpose,
        visibility: community.visibility,
        organization: {
          name: community.organization?.name || "Unknown Organization",
          id: community.organization?._id?.toString() || "",
        },
      }
    };
  } catch (error) {
    console.error("Error fetching community by ID:", error);
    return { success: false, message: "Failed to fetch community." };
  }
};

/**
 * Adds a user to a community
 */
export async function addUserToCommunity(communityId, userId, role = "member") {
  try {
    await connect();

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return { success: false, message: 'Invalid community ID' };
    }

    if (!userId || typeof userId !== 'string') {
      return { success: false, message: 'Invalid user ID' };
    }

    // Update the user document to add community to their communities array
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          communities: {
            community: communityId,
            role: role
          }
        }
      }
    );

    return { success: true, message: `User added to community` };
  } catch (error) {
    console.error('Error adding user to community:', error.message);
    return { success: false, message: 'Failed to add user to community' };
  }
}

/**
 * Searches for communities by name
 */
export async function searchCommunities(query) {
  try {
    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return {
        success: false,
        message: "Query must be a string with at least 2 characters",
      };
    }

    await connect();

    // Create a case-insensitive regex for the query
    const regex = new RegExp(query.trim(), "i");

    // Search communities by name
    const communities = await Community.find({
      name: { $regex: regex }
    })
    .populate('organization')
    .select("name")
    .limit(10)
    .lean();

    const formattedCommunities = communities.map((community) => ({
      id: community._id.toString(),
      name: community.name.trim(),
      organization: {
        id: community.organization?._id.toString(),
        name: community.organization?.name || "Unknown Organization",
      }
    }));

    return {
      success: true,
      data: formattedCommunities,
    };
  } catch (error) {
    console.error("Error searching communities:", error);
    return {
      success: false,
      message: "Failed to search communities",
    };
  }
}

/**
 * Gets all communities
 */
export const getAllCommunities = async function () {
  try {
    await connect();

    const communities = await Community.find()
      .populate({
        path: "organization",
        select: "name",
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
    console.error("Error fetching all communities:", error);
    return [];
  }
};

/**
 * Updates a community
 */
export async function updateCommunity(formData) {
  if (!formData.id) return { success: false, message: "Community ID is required." };

  try {
    const id = formData.id;
    const name = formData.name?.trim();
    const purpose = formData.purpose?.trim();
    const visibility = formData.visibility?.trim();

    if (!name) return { success: false, message: "Community name is required." };
    if (!purpose) return { success: false, message: "Purpose is required." };
    if (!visibility) return { success: false, message: "Visibility is required." };

    await connect();

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      {
        name,
        purpose,
        visibility,
      },
      { new: true }
    );

    if (!updatedCommunity) {
      return { success: false, message: "Community not found." };
    }

    return {
      success: true,
      message: "Community updated successfully!",
      community: {
        id: updatedCommunity._id.toString(),
        name: updatedCommunity.name,
        purpose: updatedCommunity.purpose,
        visibility: updatedCommunity.visibility,
      },
    };
  } catch (error) {
    console.error("Error updating community:", error);
    return { success: false, message: "Failed to update community." };
  }
}