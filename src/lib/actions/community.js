"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import User from '../models/user.model';
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

    return communities.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id?.toString() || "", // ✅ Convert ObjectId safely
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
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error('User not authenticated');
    }

    const clerkId = clerkUser.id;

    // Find the user in your custom User table by clerkId
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const userId = dbUser._id; // Your custom MongoDB User ID

    // Fetch communities where this user is a member
    const communities = await Community.find({ members: userId }).select('name _id');

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