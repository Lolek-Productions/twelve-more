"use server";

import Organization from "@/lib/models/organization.model"; // Define this model
import { connect } from "@/lib/mongodb/mongoose";
import { requireUser } from "@/lib/auth";
import Community from "@/lib/models/community.model";
import User from '../models/user.model';
import {
  addCommunityToUser,
  addOrganizationToUser, getUserById,
  removeCommunitiesFromAllUsers,
  removeOrganizationsFromAllUsers
} from "@/lib/actions/user.js";
import {
  deleteCommunities,
  getCommunitiesByOrganization,
} from "@/lib/actions/community.js";
import {currentUser} from "@clerk/nextjs/server";

//This is the main function for creating a new organization
export async function createOrganizationWithWelcomingCommunity(formData, userId) {
  await requireUser();
  try {
    await connect();

    const data = await Organization.create({
      name: formData.name,
      description: formData.description,
      createdBy: userId,
    });

    const organization = {
      id: data._id?.toString() || "",
      name: data.name,
      description: data.description,
    }

    const orgAddResult = await addOrganizationToUser(organization.id, userId, 'leader');
    if (!orgAddResult.success) {
      throw new Error(`Failed to associate organization with user: ${orgAddResult.error}`);
    }

    //Welcoming Community
    const community1 = await Community.create({
      name: `Welcome to ${data.name}!`,
      purpose: `To warmly invite new members to feel a greater sense of belonging at ${data.name}`,
      visibility: "public",
      createdBy: userId,
      organization: organization.id,
    });

    // Add the community to the organization as the welcomingCommunity
    await Organization.findByIdAndUpdate(
      organization.id,
      { welcomingCommunity: community1._id }
    );

    // Add community to User (consider a specific function to add as admin)
    const comAddResult = await addCommunityToUser(community1._id.toString(), userId, 'leader', false);
    if (!comAddResult.success) {
      console.warn(`Failed to add community to user: ${comAddResult.error}`);
    }

    //Leadership Community
    const leadershipCommunity = await Community.create({
      name: `${data.name} Leadership Community`,
      purpose: `To help develop the leadership of communities at ${data.name}.  Newly leaders of groups will be automatically added to this group.`,
      visibility: "private",
      createdBy: userId,
      organization: organization.id,
    });

    await Organization.findByIdAndUpdate(
      organization.id,
      { leadershipCommunity: leadershipCommunity._id }
    );

    // Add community to User
    const leadershipResult = await addCommunityToUser(leadershipCommunity._id.toString(), userId, 'leader', false);
    if (!leadershipResult.success) {
      console.warn(`Failed to add community to user: ${leadershipResult.error}`);
    }

    //Various individual communities
    const community2 = await Community.create({
      name: `Lectors`,
      purpose: `To boldly proclaim the word of God!`,
      visibility: "public",
      createdBy: userId,
      organization: organization.id,
    });
    await addCommunityToUser(community2._id.toString(), userId, 'leader', false);

    const community3 = await Community.create({
      name: `Ushers`,
      purpose: `To communicate the love of God to all those who join us at Mass!`,
      visibility: "public",
      createdBy: userId,
      organization: organization.id,
    });
    await addCommunityToUser(community3._id.toString(), userId, 'leader', false);

    const community4 = await Community.create({
      name: `Religious Education Teachers`,
      purpose: `To teach our children how to Love God!`,
      visibility: "public",
      createdBy: userId,
      organization: organization.id,
    });
    await addCommunityToUser(community4._id.toString(), userId, 'leader', false);

    const community5 = await Community.create({
      name: `Ministers of Holy Communion`,
      purpose: `To assist the priest in the distribution of the Holy Sacrament!`,
      visibility: "public",
      createdBy: userId,
      organization: organization.id,
    });
    await addCommunityToUser(community5._id.toString(), userId, 'leader', false);

    return { success: true, message: "Organization created", organization: organization };
  } catch (error) {
    return { success: false, message:error.message };
  }
}

export async function deleteOrganization(organizationId) {
  await requireUser();
  try {
    console.log('organization Id:', organizationId);
    // return;

    const organizationToDelete = await getOrganizationById(organizationId);
    if (!organizationToDelete) {
      return { success: false, message: 'Organization not found'};
    }

    await connect();

    // Delete all communities in this organization
    const communities = await getCommunitiesByOrganization(organizationId);
    if (communities.length > 0) {
      const communityIds = communities.map(community => community.id);
      await deleteCommunities(communityIds);
    }

    // Remove organization from all users
    await removeOrganizationsFromAllUsers(organizationId);

    // Finally, delete the organization itself
    await Organization.findByIdAndDelete(organizationId);

    return { success: true, message: "Successfully deleted organization" };
  } catch (error) {
    console.error('Error deleting organization:', error);
    return { success: false, message: 'Problem deleting organization'};
  }
}

export async function getOrganizations() {
  await requireUser();
  try {
    await connect();
    const orgs = await Organization.find().lean();
    return orgs.map(org => ({
      id: org._id.toString(),
      name: org.name,
      ownerPhoneNumber: org.ownerPhoneNumber,
      members: org.members || [],
    }));
  } catch (error) {
    console.error('Error getting organizations:', error);
    return { success: false, message: 'Failed to get organizations' };
  }
}

export const getOrganizationById = async function (organizationId) {
  try {
    await connect(); // Ensure database connection

    const organization = await Organization
      .findById(organizationId)
      .populate('welcomingCommunity')
      .populate('leadershipCommunity')
      .lean();

    if (!organization) {
      console.error("No organization found for ID:", organizationId);
      return null;
    }

    return {
      success: true,
      organization: {
        id: organization._id?.toString() || "",
        name: organization.name,
        description: organization.description,
        welcomingCommunity: {
          id: organization.welcomingCommunity?.id,
          name: organization.welcomingCommunity?.name
        },
        leadershipCommunity: {
          id: organization.leadershipCommunity?.id,
          name: organization.leadershipCommunity?.name
        },
      }
    };
  } catch (error) {
    console.error("Error fetching organization by ID:", error);
    return {success: false, message: error.message};
  }
};

export async function searchOrganizations(query) {
  try {
    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return {
        success: false,
        message:"Query must be a string with at least 2 characters",
      };
    }

    await connect(); // Ensure database connection

    // Create a case-insensitive regex for the query
    const regex = new RegExp(query.trim(), "i");

    // Search users by firstName or lastName
    const organizations = await Organization.find({
        $or: [
          { name: { $regex: regex } },
        ],
      })
      .select("name") // Fetch only needed fields
      .limit(10) // Limit results for performance
      .lean(); // Return plain JS objects

    // Map results to the expected format
    const formattedOrganizations = organizations.map((organization) => ({
      id: organization._id.toString(),
      name: `${organization.name}`.trim(),
    }));

    // console.log(formattedOrganizations);

    return {
      success: true,
      data: formattedOrganizations,
    };
  } catch (error) {
    console.error("Error searching organizations:", error);
    return {
      success: false,
      message:"Failed to search organizations",
    };
  }
}

export async function setWelcomingCommunity(organizationId, communityId) {
  await requireUser();
  try {
    await connect();

    await Organization.findByIdAndUpdate(
      organizationId,
      { welcomingCommunity: communityId }
    );

    return {
      success: true,
      message: "Successfully updated Welcoming Community"
    };
  } catch (error) {
    console.error("Error updating Welcoming Community:", error);
    return {
      success: false,
      message:"Failed to update Welcoming Community",
    };
  }
}

export async function setLeadershipCommunity(organizationId, communityId) {
  await requireUser();
  try {
    await connect();

    // Update the organization with the leadership community
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { leadershipCommunity: communityId },
      { new: true }
    );

    if (!updatedOrganization) {
      return {
        success: false,
        message: 'Organization not found',
      };
    }

    return {
      success: true,
      message: 'Leadership community updated successfully',
    };
  } catch (error) {
    console.error('Error in setLeadershipCommunity:', error);
    return {
      success: false,
      message: error.message || 'Something went wrong',
    };
  }
}
