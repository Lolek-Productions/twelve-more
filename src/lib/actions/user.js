"use server";

import User from '../models/user.model';
import Organization from '../models/organization.model';
import { connect } from '../mongodb/mongoose';
import mongoose from "mongoose";
import Community from '../models/community.model';
import Post from "@/lib/models/post.model";
import twilioService from "@/lib/services/twilioService.js";
import {PUBLIC_APP_URL} from "@/lib/constants.js";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  phone_numbers,
  username
) => {
  try {
    await connect();

    const email = Array.isArray(email_addresses) && email_addresses.length > 0
      ? email_addresses[0]?.email_address
      : null; // Fallback to null if empty

    const phoneNumber = Array.isArray(phone_numbers) && phone_numbers.length > 0
      ? phone_numbers[0]?.phone_number
      : null; // Fallback to null if empty

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          avatar: image_url,
          email,
          username,
          phoneNumber,
        },
      },
      { new: true, upsert: true }
    );

    return user;
  } catch (error) {
    console.error('Error creating or updating user:', error);
    throw error; // Re-throw for better debugging
  }
};

export async function getUserById(userId) {
  try {
    await connect();

    const user = await User.findById(userId)
      .populate({
        path: 'organizations.organization',
        populate: {
          path: 'welcomingCommunity',
          select: '_id name'
        }
      })
      .populate({
        path: 'communities.community',
        populate: {
          path: 'organization',
          select: '_id name',
          populate: {
            path: 'welcomingCommunity',
            select: '_id name'
          }
        }
      })
      .lean();


    return {
      success: true,
      user: {
        id: user._id?.toString() || "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        clerkId: user.clerkId,
        organizations: user.organizations
          ? user.organizations.map((org) => ({
            id: org.organization?._id.toString(),
            name: org.organization?.name || "Empty Organization",
            role: org.role || "",
            membershipId: org._id.toString(),
            welcomingCommunity: org.organization?.welcomingCommunity
              ? {
                id: org.organization.welcomingCommunity._id.toString(),
                name: org.organization.welcomingCommunity.name
              }
              : null
          }))
          : [],
        communities: user.communities
          ? user.communities.map((com) => ({
            id: com.community?._id.toString(),       // Populated _id
            name: com.community?.name || "Empty Community", // Populated name
            role: com.role || "",
            visibility: com.visibility,
            membershipId: com._id.toString(),
            organizationId: com.community?.organization?._id.toString() || null,
            organizationName: com.community?.organization?.name || null,
// return console.log(user.communities[0].community.organization.welcomingCommunity._id);
            welcomingCommunityId: com.community?.organization?.welcomingCommunity?._id?.toString() || null,
          }))
          : [],
      }
    };
  } catch (error) {
    console.error('Error fetching user from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, message:`Failed to fetch users: ${error.message}` }
  }
}

export async function getUserByIdByAppUser(userId, appUser) {
  try {
    await connect();

    const user = await User.findById(userId)
      .populate('organizations.organization')
      .populate({
        path: 'communities.community',
        populate: {
          path: 'organization',
          select: '_id name visibility'
        }
      })
      .lean();

    const appUserCommunityIds = [];
    if (appUser && appUser.communities) {
      // Use map to extract the community IDs from appUser
      appUser.communities.forEach(comm => {
        appUserCommunityIds.push(comm.id);
      });
    }

    return {
      success: true,
      user: {
        id: user._id?.toString() || "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        clerkId: user.clerkId,
        organizations: user.organizations
          ? user.organizations.map((org) => ({
            id: org.organization?._id.toString(),
            name: org.organization?.name || "Empty Organization",
            role: org.role || "",
            membershipId: org._id.toString(),
          }))
          : [],
        communities: user.communities
          ? user.communities
            .filter(com => {
              // Only include a community if:
              // 1. It's public
              // 2. OR the appUser is a member of it
              // 3. OR the user looking at the profile is the profile owner (userId === appUser._id)
              const communityId = com.community?._id.toString();

              return (
                (com.community?.visibility === 'public') ||
                (appUserCommunityIds.includes(communityId)) ||
                (appUser && appUser.id === userId)
              );
            })
            .map((com) => ({
              id: com.community?._id.toString(),
              name: com.community?.name || "Empty Community",
              role: com.role || "",
              visibility: com.community?.visibility,
              membershipId: com._id.toString(),
              organizationId: com.community?.organization?._id.toString() || null,
              organizationName: com.community?.organization?.name || null,
            }))
          : [],
      }
    };
  } catch (error) {
    console.error('Error fetching user from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, message:`Failed to fetch users: ${error.message}` }
  }
}

export async function getPrivateUserById(userId) {
  try {
    await connect();

    const user = await User.findById(userId)
      .populate('organizations.organization')
      .populate({
        path: 'communities.community',
        populate: {
          path: 'organization',
          select: '_id name visibility'
        }
      })
      .lean();

    return {
      success: true,
      user: {
        id: user._id?.toString() || "",
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        clerkId: user.clerkId,
        organizations: user.organizations
          ? user.organizations.map((org) => ({
            id: org.organization?._id.toString(),
            name: org.organization?.name || "Empty Organization",
            role: org.role || "",
            membershipId: org._id.toString(),
          }))
          : [],
        communities: user.communities
          ? user.communities.map((com) => ({
            id: com.community?._id.toString(),       // Populated _id
            name: com.community?.name || "Empty Community", // Populated name
            role: com.role || "",
            membershipId: com._id.toString(),
            visibility: com.visibility,
            organizationId: com.community?.organization?._id.toString() || null,
            organizationName: com.community?.organization?.name || null,
          }))
          : [],
      }
    };
  } catch (error) {
    console.error('Error fetching user from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, message: error.message };
  }
}

export const getUserByClerkId = async (clerkId) => {
  try {
    await connect();

    const user = await User.findOne({ clerkId })
      .lean();

    if (!user) {
      return { success: false, message:'User not found' };
    }

    return {
      success: true,
      user: {
        id: user._id?.toString() || "",
        firstName: user.firstName,
        lastName: user.lastName,
        clerkId: user.clerkId,
      },
    };
  } catch (error) {
    console.error('Error fetching user by Clerk ID from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, message: error.message };
  }
};

export async function updateUser(user) {
  try {
    await connect();

    // Ensure user is authenticated/provided
    if (!user || !user.id) {
      return {
        success: false,
        message:'User not found or invalid input',
      };
    }

    // Find and update the user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id }, // Match user by MongoDB ID
      {
        $set: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: user.bio,
        },
      },
      { new: true } // Return updated user
    );

    if (!updatedUser) {
      return {
        success: false,
        message:'User not found',
      };
    }

    return {
      success: true,
      data: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        bio: updatedUser.bio,
      },
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      message:'Error updating user',
    };
  }
}

export async function addOrganizationToUser(organizationId, userId, role = 'member') {
  try {
    await connect();

    const org = await Organization.findById(organizationId);

    if(!org) {
      return { success: false, message: 'Organization not found' };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          organizations: {
            organization: organizationId,
            role: role
          }
        }
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return { success: false, message:"User not found" };
    }

    return { success: true, message: "User added to organization" };
  } catch (error) {
    return { success: false, message:error.message };
  }
}

export async function removeOrganizationFromUserByMembershipId(organizationMembershipId, userId) {
  try {
    await connect();

    // Update User's organizations array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { organizations: { _id: organizationMembershipId } } },
      { new: true } // Return the updated document
    );

    if (!user) {
      return { success: false, message:"User or organization not found" };
    }

    return { success: true, message: "User removed from organization" };
  } catch (error) {
    return { success: false, message:error.message };
  }
}

export const deleteUserByClerkId = async (id) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const deleteUser = async (id) => {
  try {
    // Validate input
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message:"Invalid or missing user ID" };
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return { success: false, message:"User not found" };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message:error.message,
    };
  }
};

export const getUsers = async () => {
  try {
    await connect();

    // Fetch all users from MongoDB as plain objects
    const users = await User.find().select('firstName lastName username clerkId').lean();

    return {
      success: true,
      users: users.map(user => ({
        id: user._id.toString(), // Use MongoDB _id as the identifier
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        clerkId: user.clerkId
      })),
    };
  } catch (error) {
    console.error('Error fetching users from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, message:'Failed to fetch users', details: error.message };
  }
};

export const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    await connect();

    const user = await User.findOne({ phoneNumber }).lean();

    if (!user) {
      return {
        success: false,
        message:"User not found with this phone number",
      };
    }

    return {
      success: true,
      data: {
        id: user._id.toString(),
        clerkId: user.clerkId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export async function searchAllUsers(query) {
  try {
    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return {
        success: false,
        message: "Query must be a string with at least 2 characters",
      };
    }

    await connect(); // Ensure database connection

    // Create a case-insensitive regex for the query
    const regex = new RegExp(query.trim(), "i");

    // Search users by firstName or lastName
    const users = await User.find({
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
        ],
      })
      .select("firstName lastName") // Fetch only needed fields
      .limit(10) // Limit results for performance
      .lean(); // Return plain JS objects

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
    }));

    return {
      success: true,
      users: formattedUsers,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message:"Failed to search users",
    };
  }
}

export async function searchUsersInUserOrganizations(appUser, query) {
  try {
    await connect();

    const users = await User.find({
      "organizations.organization": { $in: appUser.organizations.map(c => c.id) },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { $expr: { $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: query,
              options: "i"
            }}
        }
      ],
    })
      .select("firstName lastName")
      .limit(10)
      .lean();

    const mappedUsers = users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    }));
    return { success: true, users: mappedUsers };
  } catch (error) {
    console.error("Error searching users in organization:", error);
    return [];
  }
}

export async function addCommunityToUser(communityId, userId, role = 'member', attemptToNotify = true) {
  try {
    await connect();

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      console.error('Missing communityId');
      return { success: false, message:"Invalid community ID" };
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Missing userId');
      return { success: false, message:"Invalid user ID" };
    }

    // Check if user is already a member of the community
    const user = await User.findById(userId).lean();
    if (!user) {
      console.error("User not found with that id", userId);
      return { success: false, message:"User not found" };
    }

    const isAlreadyMember = user.communities.some(c => c.community.toString() === communityId);
    if (isAlreadyMember) {
      console.warn('User is already a member of that community');
      return { success: false, message:"User is already a member of this community" };
    }

    // Update user by adding communityId to communities array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { communities: { community: communityId, role: role } } },
      { new: true }
    )
    .populate('communities.community')
    .lean();

    //Notify the leaders of this organization that someone has joined
    const leadersResponse = await getPrivateLeadersByCommunityId(communityId);

    if(leadersResponse.success && leadersResponse.leaders?.length > 0 && attemptToNotify) {
      const leadersPhoneNumbers = leadersResponse.leaders
        .map((leader) => leader.phoneNumber)
        .filter(phoneNumber => phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim() !== '');

      if (leadersPhoneNumbers.length > 0) {
        // Find the community that was just added
        const addedCommunity = updatedUser.communities.find(
          comm => comm.community._id.toString() === communityId
        );
        const addedCommunityName = addedCommunity ? addedCommunity.community.name : null;

        const message = `${updatedUser.firstName} ${updatedUser.lastName} has joined your community ${addedCommunityName}!  Be sure to welcome them to the 12!  ${PUBLIC_APP_URL}/communities/${communityId}/posts`;
        const smsResponse = await twilioService.sendBatchSMS(leadersPhoneNumbers, message);
        // console.log('SMS notification to leaders:', smsResponse);
      }
    }

    return { success: true, message: `Community added to user` };
  } catch (error) {
    console.error("Error adding community to user:", error.message);
    return { success: false, message:"Failed to add community to user" };
  }
}

export async function removeCommunityFromUserByMembershipId(communityMembershipId, userId) {
  try {
    // Input validation
    if (!communityMembershipId || !mongoose.isValidObjectId(communityMembershipId)) {
      return {
        success: false,
        message:"Invalid or missing community ID",
      };
    }
    if (!userId || typeof userId !== "string") { // Adjusted for Clerk ID string
      return {
        success: false,
        message:"Invalid or missing user ID",
      };
    }

    await connect(); // Ensure database connection

    // Update the user by pulling the communityId from communities array
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { communities: { _id: communityMembershipId } } }
    );

    // console.log(result);

    // Check if the operation modified anything
    if (result.modifiedCount === 0) {
      return {
        success: false,
        message:"Community not found in user's communities or user does not exist",
      };
    }

    return {
      success: true,
      message: "Community removed from user",
    };
  } catch (error) {
    console.error("Error removing community from user:", error);
    return {
      success: false,
      message:"Failed to remove community from user",
    };
  }
}

export async function removeCommunityFromUser(communityId, userId) {
  try {
    // Input validation
    if (!communityId || !mongoose.isValidObjectId(communityId)) {
      return {
        success: false,
        message:"Invalid or missing community ID",
      };
    }
    if (!userId || typeof userId !== "string") { // Adjusted for Clerk ID string
      return {
        success: false,
        message:"Invalid or missing user ID",
      };
    }

    await connect(); // Ensure database connection

    // Update the user by pulling the communityId from communities array
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { communities: { community: communityId } } }
    );

    // Check if the operation modified anything
    if (result.modifiedCount === 0) {
      return {
        success: false,
        message:"Community not found in user's communities or user does not exist",
      };
    }

    return {
      success: true,
      message: "Community removed from user",
    };
  } catch (error) {
    console.error("Error removing community from user:", error);
    return {
      success: false,
      message:"Failed to remove community from user",
    };
  }
}

export async function getCommunityMembers(communityId) {
  try {
    // Input validation
    if (!communityId || !mongoose.isValidObjectId(communityId)) {
      return {
        success: false,
        message: "Invalid or missing community ID",
      };
    }

    await connect(); // Ensure database connection

    // Use aggregation to get users and only the relevant community membership
    const members = await User.aggregate([
      // Match users who are members of this community
      {
        $match: {
          "communities.community": new mongoose.Types.ObjectId(communityId)
        }
      },
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          // Get only the community membership for the specified communityId
          communityMembership: {
            $filter: {
              input: "$communities",
              as: "community",
              cond: { $eq: ["$$community.community", new mongoose.Types.ObjectId(communityId)] }
            }
          }
        }
      },
      // Unwind the filtered array which now contains only the relevant membership
      {
        $unwind: "$communityMembership"
      }
    ]);

    // console.log('members', members);


    // Check if any members were found
    if (!members || members?.length === 0) {
      return {
        success: true,
        message: "No members found in this community",
        data: [],
      };
    }

    return {
      success: true,
      message: "Community members retrieved successfully",
      data: members.map((member) => ({
        id: member._id.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        avatar: member.avatar,
        role: member.communityMembership.role || "member",
        membershipId: member.communityMembership._id.toString()
      })),
    };
  } catch (error) {
    console.error("Error fetching community members:", error);
    return {
      success: false,
      message: "Failed to fetch community members",
      error: error.message
    };
  }
}

export async function getRecentOrganizationsMembers(organizationIds, limit = 7) {

  try {
    // Input validation

    await connect(); // Ensure database connection

    // Find the 10 most recent users in the organization, sorted by createdAt descending
    const members = await User.find({
        "organizations.organization": { $in: organizationIds },
      })
      .select("firstName lastName avatar createdAt") // Include createdAt for sorting
      .sort({ createdAt: -1 }) // -1 for descending (newest first)
      .limit(limit)

    // Check if any members were found
    if (!members || members.length === 0) {
      return {
        success: true,
        message: "No members found in this organization",
        data: [],
      };
    }

    return {
      success: true,
      message: "10 most recent organization members retrieved successfully",
      data: members.map((member) => ({
        id: member._id.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        avatar: member.avatar,
        createdAt: member.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching recent community members:", error);
    return {
      success: false,
      message: "Failed to fetch recent community members",
    };
  }
}

export async function removeCommunitiesFromAllUsers(communityIds) {
  try {
    await connect();

    // Validate input - handle both single ID and array of IDs
    if (!communityIds) {
      return { success: false, message: "Community ID(s) are required." };
    }

    // Convert single ID to array if needed
    const idsArray = Array.isArray(communityIds) ? communityIds : [communityIds];

    if (idsArray.length === 0) {
      return { success: false, message: "At least one community ID is required." };
    }

    // Remove communities from all users' communities array
    const updateResult = await User.updateMany(
      { "communities.community": { $in: idsArray } },
      { $pull: { communities: { community: { $in: idsArray } } } }
    );

    return {
      success: true,
      message: `Communities removed from ${updateResult.modifiedCount} users`,
      modifiedCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error("Error removing community references:", error);
    return { success: false, message: "Failed to remove community references from users." };
  }
}

export async function removeOrganizationsFromAllUsers(organizationIds) {
  try {
    await connect();

    // Validate input - handle both single ID and array of IDs
    if (!organizationIds) {
      return { success: false, message: "Organization ID(s) are required." };
    }

    // Convert single ID to array if needed
    const idsArray = Array.isArray(organizationIds) ? organizationIds : [organizationIds];

    if (idsArray.length === 0) {
      return { success: false, message: "At least one organization ID is required." };
    }

    // Remove organizations from all users' organizations array
    const updateResult = await User.updateMany(
      { "organizations.organization": { $in: idsArray } },
      { $pull: { organizations: { organization: { $in: idsArray } } } }
    );

    return {
      success: true,
      message: `Organization(s) removed from ${updateResult.modifiedCount} users`,
      modifiedCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error("Error removing organization references:", error);
    return { success: false, message: "Failed to remove organization references from users." };
  }
}

export async function getPrivateLeadersByCommunityId(communityId) {
  try {
    if (!communityId) {
      return { success: false, message: "Community ID is required" };
    }

    await connect();

    const leaders = await User.find({
      communities: {
        $elemMatch: {
          community: communityId,
          role: "leader"
        }
      }
    }).select('firstName lastName email phoneNumber avatar username bio');

    return {
      success: true,
      leaders: leaders.map(leader => ({
        id: leader._id.toString(),
        firstName: leader.firstName,
        lastName: leader.lastName,
        phoneNumber: leader.phoneNumber,
        avatar: leader.avatar,
      }))
    };
  } catch (error) {
    console.error("Error fetching community leaders:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch community leaders"
    };
  }
}

export async function changeRoleOnUserInCommunity(userId, communityId, role) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "communities.community": communityId // Find the specific community in the user's communities array
      },
      {
        $set: { "communities.$.role": role } // Update the role for the matched community
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return {
        success: false,
        message: "User not found or user is not a member of this community"
      };
    }

    return {
      success: true,
      message: "User updated"
    };
  } catch (error) {
    console.error("Error changing user role in community:", error);
    return {
      success: false,
      message: error.message || "Failed to change user role"
    };
  }
}

export async function changeRoleOnUserInOrganization(userId, organizationId, role) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "organizations.organization": organizationId // Find the specific organization in the user's organizations array
      },
      {
        $set: { "organizations.$.role": role } // Update the role for the matched organization
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return {
        success: false,
        message: "User not found or user is not a member of this organization"
      };
    }

    return {
      success: true,
      message: "User role updated"
    };
  } catch (error) {
    console.error("Error changing user role in organization:", error);
    return {
      success: false,
      message: error.message || "Failed to change user role"
    };
  }
}