'use server'

import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/post.model";
import User from '@/lib/models/user.model';
import Community from "@/lib/models/community.model.js";
import Organization from "@/lib/models/organization.model.js";

export async function getNewPostCountForDateRange(startDate, endDate, options = { inclusive: true }) {
  // Convert string dates to Date objects if necessary
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  // If inclusive, set the times to beginning/end of day
  const rangeStart = options.inclusive ?
    new Date(start.getFullYear(), start.getMonth(), start.getDate()) :
    start;

  const rangeEnd = options.inclusive ?
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) :
    end;

  try {
    const count = await Post.countDocuments({
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    });

    return {success: true, count: count};
  } catch (error) {
    console.error(`Error counting posts between ${rangeStart} and ${rangeEnd}:`, error);
    throw error;
  }
}

export async function getNewUserCountForDateRange(startDate, endDate, options = { inclusive: true }) {
  // Convert string dates to Date objects if necessary
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  // If inclusive, set the times to beginning/end of day
  const rangeStart = options.inclusive ?
    new Date(start.getFullYear(), start.getMonth(), start.getDate()) :
    start;

  const rangeEnd = options.inclusive ?
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) :
    end;

  try {
    const count = await User.countDocuments({
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    });

    return {success: true, count: count};
  } catch (error) {
    console.error(`Error counting posts between ${rangeStart} and ${rangeEnd}:`, error);
    throw error;
  }
}

export async function getNewCommunityCountForDateRange(startDate, endDate, options = { inclusive: true }) {
  // Convert string dates to Date objects if necessary
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  // If inclusive, set the times to beginning/end of day
  const rangeStart = options.inclusive ?
    new Date(start.getFullYear(), start.getMonth(), start.getDate()) :
    start;

  const rangeEnd = options.inclusive ?
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) :
    end;

  try {
    const count = await Community.countDocuments({
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    });

    return {success: true, count: count};
  } catch (error) {
    console.error(`Error counting posts between ${rangeStart} and ${rangeEnd}:`, error);
    throw error;
  }
}

export async function getNewOrganizationCountForDateRange(startDate, endDate, options = { inclusive: true }) {
  // Convert string dates to Date objects if necessary
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  // If inclusive, set the times to beginning/end of day
  const rangeStart = options.inclusive ?
    new Date(start.getFullYear(), start.getMonth(), start.getDate()) :
    start;

  const rangeEnd = options.inclusive ?
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) :
    end;

  try {
    const count = await Organization.countDocuments({
      createdAt: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    });

    return {success: true, count: count};
  } catch (error) {
    console.error(`Error counting posts between ${rangeStart} and ${rangeEnd}:`, error);
    throw error;
  }
}