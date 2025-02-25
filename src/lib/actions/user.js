"use server";

import User from '../models/user.model';
import { connect } from '../mongodb/mongoose';

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

