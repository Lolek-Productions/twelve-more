"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import User from '../models/user.model';
import { connect } from '../mongodb/mongoose';
import { clerkClient } from '@clerk/nextjs/server';
import {addCommunityToUser, removeCommunitiesFromAllUsers} from "@/lib/actions/user.js";
import {getOrganizationById} from "@/lib/actions/organization.js";

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

    // Add the new leader to the leadership community on the organization
    try {
      const orgData = await getOrganizationById(organizationId);

      if (orgData.organization?.leadershipCommunity) {
        const leadershipCommunityId = orgData.organization.leadershipCommunity.id;

        if (leadershipCommunityId) {
          console.log(`Adding user ${userId} to leadership community ${leadershipCommunityId}`);
          await addCommunityToUser(leadershipCommunityId, userId);
        } else {
          console.log("Leadership community ID not found");
        }
      } else {
        console.log("Organization does not have a leadership community");
      }
    } catch (error) {
      // Log the error but don't fail the whole function
      console.error("Error adding user to leadership community:", error);
    }

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

//Takes a string or an array
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

export const getCommunityById = async function (communityId) {
  try {
    if (!communityId) {
      return { success: false, message: "Community ID is required." };
    }

    await connect();

    const community = await Community.findById(communityId)
      .populate({
        path: 'organization',
        populate: [
          { path: 'welcomingCommunity' },
          { path: 'leadershipCommunity' }
        ]
      })
      .lean();

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
          welcomingCommunityId: community.organization?.welcomingCommunity?._id?.toString(),
          leadershipCommunityId: community.organization?.leadershipCommunity?._id?.toString(),
        },
      }
    };
  } catch (error) {
    console.error("Error fetching community by ID:", error);
    return { success: false, message: "Failed to fetch community." };
  }
};

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

export async function updateCommunity(communityId, formData) {
  if (!communityId) return { success: false, message: "Community ID is required." };

  try {
    const name = formData.name?.trim();
    const purpose = formData.purpose?.trim();
    const visibility = formData.visibility?.trim();

    if (!name) return { success: false, message: "Community name is required." };
    if (!purpose) return { success: false, message: "Purpose is required." };
    if (!visibility) return { success: false, message: "Visibility is required." };

    await connect();

    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
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

export async function changeOrganizationOfCommunity(organizationId, communityId) {
  try {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    // 1. Update the community's organization
    const updatedCommunity = await Community.findOneAndUpdate(
      { _id: communityId },
      { $set: { organization: organizationId } },
      { new: true, session }
    );

    if (!updatedCommunity) {
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false,
        message: "Could not find or update this community"
      };
    }

    // 2. Use updateMany to add the organization to all users who:
    // - Are members of this community
    // - Don't already have this organization
    const userUpdateResult = await User.updateMany(
      {
        "communities.community": communityId,
        "organizations.organization": { $ne: organizationId } // Users who don't have this org
      },
      {
        $push: {
          organizations: {
            organization: organizationId,
            role: "member"
          }
        }
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();

    return {
      success: true,
      message: `Community updated and ${userUpdateResult.modifiedCount} users given access to the organization`
    };
  } catch (error) {
    console.error("Error changing organization of this community:", error);

    // Ensure transaction is aborted on error
    try {
      await session.abortTransaction();
      await session.endSession();
    } catch (cleanupError) {
      console.error("Error cleaning up transaction:", cleanupError);
    }

    return {
      success: false,
      message: error.message || "Failed to change organization"
    };
  }
}

export async function addAllLeadersToCommunitiy(organizationId, targetCommunityId) {
  try {
    await connect();

    // Find all communities in this organization
    const communities = await Community.find({ organization: organizationId });

    if (!communities || communities.length === 0) {
      return {
        success: false,
        message: 'No communities found in this organization',
      };
    }

    // Find all users who are leaders in any community of this organization
    const users = await User.find({
      'communities.role': 'leader',
      'organizations.organization': organizationId
    });

    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'No community leaders found in this organization',
      };
    }

    // Set to track unique users who've been added (to prevent duplicates)
    const addedLeaders = new Set();
    const communityIds = communities.map(comm => comm._id.toString());

    // Process each user
    for (const user of users) {
      // Skip if we've already processed this user
      if (addedLeaders.has(user._id.toString())) continue;

      // Check if the user is a leader in any community of this organization
      const isLeaderInOrg = user.communities.some(membership => {
        return communityIds.includes(membership.community.toString()) &&
          membership.role === 'leader';
      });

      if (isLeaderInOrg) {
        // Add user to the target community as a member
        const addResult = await addCommunityToUser(targetCommunityId, user._id.toString());
        if (addResult.success) {
          addedLeaders.add(user._id.toString());
        }
      }
    }

    return {
      success: true,
      message: `Added ${addedLeaders.size} leaders to the community`,
    };
  } catch (error) {
    console.error('Error adding leaders to community:', error);
    return {
      success: false,
      message: error.message || 'Failed to add leaders to community',
    };
  }
}