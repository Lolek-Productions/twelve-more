'use server'

import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/post.model";
import User from '@/lib/models/user.model';

/**
 * Gets all posts created today
 * @returns {Promise<Array>} Array of post documents created today
 */
export async function getTodaysPosts() {
  // Get current date
  const now = new Date();

  // Set to the beginning of today (midnight)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Set to the end of today (23:59:59.999)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  try {
    const posts = await Post.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ createdAt: -1 });

    return posts;
  } catch (error) {
    console.error('Error finding today\'s posts:', error);
    throw error;
  }
}

/**
 * Gets the count of posts created today
 * @returns {Promise<Number>} Count of posts created today
 */
export async function getTodaysPostCount() {
  // Get current date
  const now = new Date();

  // Set to the beginning of today (midnight)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Set to the end of today (23:59:59.999)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  try {
    const count = await Post.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return count;
  } catch (error) {
    console.error('Error counting today\'s posts:', error);
    throw error;
  }
}