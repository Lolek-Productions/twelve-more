"use server";

import mongoose from "mongoose";
import Community from '../models/community.model';
import { connect } from '../mongodb/mongoose';

export async function createOrUpdateCommunity(formData) {
  console.log('hello createOrUpdateCommunity:', formData);

  const { id, name } = formData;

  if (!name) {
    return { error: "Community name is required." };
  }

  try {
    await connect();

    const filter = id ? { _id: new mongoose.Types.ObjectId(id) } : {};

    const community = await Community.findOneAndUpdate(
      filter,
      {
        $set: {
          name: name,
        },
      },
      { new: true, upsert: true }
    );
    return { success: "Community created successfully!" };
  } catch (error) {
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