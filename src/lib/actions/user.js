"use server";

import User from '../models/user.model';
import Community from '../models/community.model';
import { connect } from '../mongodb/mongoose';
import mongoose from "mongoose";

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

export const deleteUser = async (id) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const getAllUsers = async () => {
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
      { $addToSet: { communities: { communityId, role: "member" } } }, // Add community with default role
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
  // console.log(communityId, userId); // Uncomment for debugging if needed

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
      { $pull: { communities: { communityId } } }
    );

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