"use server";

import User from '../models/user.model';
import Community from '../models/community.model';
import Organization from '../models/organization.model';
import { connect } from '../mongodb/mongoose';
import mongoose from "mongoose";
import Post from "@/lib/models/post.model";

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
      .populate('organizations.organization')
      .populate('communities.community')
      .populate('selectedOrganization')
      .lean();

    return {
      success: true,
      user: {
        id: user._id?.toString() || "",
        firstName: user.firstName,
        lastName: user.lastName,
        clerkId: user.clerkId,
        // organizations: user.organizations
        //   ? user.organizations.map((org) => ({
        //     id: org.organizationId.toString(),
        //     name: org.name || "Empty Organization",
        //   }))
        //   : [],
        selectedOrganization: {
          id: user.selectedOrganization._id.toString(),
          name: user.selectedOrganization.name,
          description: user.selectedOrganization.description,
          role: user.selectedOrganization.role,
        },
        communities: user.communities
          ? user.communities.map((community) => ({
            id: community.community._id.toString(),       // Populated _id
            name: community.community.name || "Empth Community", // Populated name
            role: community.role || "member",
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
    return { success: false, error: 'Failed to fetch users', details: error.message };
  }
}

export const getUserByClerkId = async (clerkId) => {
  try {
    await connect();

    const user = await User.findOne({ clerkId })
      .lean();

    if (!user) {
      return { success: false, error: 'User not found' };
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
    return { success: false, error: 'Failed to fetch user', details: error.message };
  }
};

export async function updateUser(userId, updates) {
  await dbConnect();
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  return { success: !!user };
}



export async function addOrganizationToUser(organizationId, userId) {
  await dbConnect();
  const Organization = mongoose.models.Organization;
  await User.findByIdAndUpdate(userId, { $addToSet: { organizations: organizationId } });
  await Organization.findByIdAndUpdate(organizationId, { $addToSet: { members: userId } });
}

export async function removeOrganizationFromUser(userId, organizationId) {
  await dbConnect();
  const Organization = mongoose.models.Organization;
  await User.findByIdAndUpdate(userId, { $pull: { organizations: organizationId } });
  await Organization.findByIdAndUpdate(organizationId, { $pull: { members: userId } });
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
      return { success: false, error: "Invalid or missing user ID" };
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
      details: error.message,
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
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.clerkId,
      })),
    };
  } catch (error) {
    console.error('Error fetching users from MongoDB:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, error: 'Failed to fetch users', details: error.message };
  }
};

export const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    await connect();

    // Fetch a single user by phoneNumber
    const user = await User.findOne({ phoneNumber }).lean();

    if (!user) {
      return {
        success: false,
        error: "User not found with this phone number",
      };
    }

    // Return the user data in a simplified format
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
      error: "Failed to fetch user",
      details: error.message,
    };
  }
};

export async function searchUsers(query) {
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
    const users = await User.find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
      ],
    })
      .select("firstName lastName") // Fetch only needed fields
      .limit(10) // Limit results for performance
      .lean(); // Return plain JS objects

    // Map results to the expected format
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
      error: "Failed to search users",
    };
  }
}

export async function searchUsersInOrganization(organizationId, query) {
  //exclude org search at this point
  try {
    await connect();

    const users = await User.find({
      // "organizations.organizationId": organizationId,
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    })
      .select("firstName lastName")
      .lean();

    return users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    }));
  } catch (error) {
    console.error("Error searching users in organization:", error);
    return [];
  }
}

export async function addCommunityToUser(communityId, userId) {
  // console.log('addCommunityToUser', communityId, userId); // Uncomment for debugging if needed

  try {
    await connect();

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(communityId)) { // Fixed validation logic
      return { success: false, error: "Invalid community ID" };
    }
    if (!userId || typeof userId !== "string") {
      return { success: false, error: "Invalid user ID" };
    }

    // Update user by adding communityId to communities array
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { communities: { community: communityId, role: "member" } } }, // Updated to 'community'
      { new: true }
    ).lean();

    console.log('updated user', user);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, message: `Community added to user` };
  } catch (error) {
    console.error("Error adding community to user:", error.message);
    return { success: false, error: "Failed to add community to user" };
  }
}

export async function removeCommunityFromUser(communityId, userId) {
  //console.log(communityId, userId); // Uncomment for debugging if needed

  try {
    // Input validation
    if (!communityId || !mongoose.isValidObjectId(communityId)) {
      return {
        success: false,
        error: "Invalid or missing community ID",
      };
    }
    if (!userId || typeof userId !== "string") { // Adjusted for Clerk ID string
      return {
        success: false,
        error: "Invalid or missing user ID",
      };
    }

    await connect(); // Ensure database connection

    // Update the user by pulling the communityId from communities array
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { communities: { community: communityId } } }
    );

    // console.log(result);

    // Check if the operation modified anything
    if (result.modifiedCount === 0) {
      return {
        success: false,
        error: "Community not found in user's communities or user does not exist",
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
      error: "Failed to remove community from user",
    };
  }
}

export async function getCommunityMembers(communityId) {
  try {
    // Input validation
    if (!communityId || !mongoose.isValidObjectId(communityId)) {
      return {
        success: false,
        error: "Invalid or missing community ID",
      };
    }

    await connect(); // Ensure database connection

    // Find all users where the communities array contains the specified communityId
    const members = await User.find({
      "communities.communityId": communityId,
    })
      .select("firstName lastName _id") // Select fields you need (adjust as needed)
      .lean(); // Return plain JS objects for performance

    // Check if any members were found
    if (!members || members.length === 0) {
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
      })),
    };
  } catch (error) {
    console.error("Error fetching community members:", error);
    return {
      success: false,
      error: "Failed to fetch community members",
    };
  }
}

export async function setSelectedOrganizationOnUser(organizationId, userId) {
  try {
    await connect();

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return { success: false, error: "Invalid organization ID" };
    }
    if (!userId || typeof userId !== "string") {
      return { success: false, error: "Invalid user ID" };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { selectedOrganization: organizationId } },
      { new: true }
    ).lean();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, message: "Selected organization updated" };
  } catch (error) {
    console.error("Error setting selected organization:", error.message);
    return { success: false, error: "Failed to set selected organization" };
  }
}