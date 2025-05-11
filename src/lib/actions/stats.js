'use server'

import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/post.model";
import User from '@/lib/models/user.model';
import Stats from '@/lib/models/stats.model';
import Community from "@/lib/models/community.model.js";
import Organization from "@/lib/models/organization.model.js";
import { getYesterdayAt8 } from "@/lib/utils";
import {clerkClient} from "@clerk/nextjs/server";
import {getSevenDaysAgoFormatted} from "@/lib/utils";

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
    await connect();

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
    await connect();

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
    await connect();

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
    await connect();

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

export async function getNewPostsForDailyStats() {
  const rangeStart = getYesterdayAt8();

  try {
    await connect();
    const count = await Post.countDocuments({
      createdAt: {
        $gte: rangeStart
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting posts between ${rangeStart} and the present:`, error);
    throw error;
  }
}

export async function getNewUsersForDailyStats() {
  const rangeStart = getYesterdayAt8();

  try {
    await connect();
    const count = await User.countDocuments({
      createdAt: {
        $gte: rangeStart
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting users between ${rangeStart} and the present:`, error);
    throw error;
  }
}

export async function getNewCommunitiesForDailyStats() {
  const rangeStart = getYesterdayAt8();

  try {
    await connect();
    const count = await Community.countDocuments({
      createdAt: {
        $gte: rangeStart
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting communities between ${rangeStart} and the present:`, error);
    throw error;
  }
}

export async function getNewOrganizationsForDailyStats() {
  const rangeStart = getYesterdayAt8();

  try {
    await connect();
    const count = await Organization.countDocuments({
      createdAt: {
        $gte: rangeStart
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting organizations between ${rangeStart} and the present:`, error);
    throw error;
  }
}

export async function getActiveUsersForDailyStats() {
  const rangeStart = getYesterdayAt8();
  const rangeStartTimestamp = rangeStart.getTime();

  try {
    const client = await clerkClient();

    const activeUsers = await client.users.getUserList({
      last_active_at_after: rangeStartTimestamp,
      limit: 500  //The number of results to return. Must be an integer greater than zero and less than 501. Can be used for paginating the results together with offset. Defaults to 10
    })

    return { success: true, count: activeUsers.data.length };
  } catch (error) {
    console.error(`Error counting active users between ${rangeStart} and the present:`, error);
    throw error;
  }
}

export async function persistDailyStats() {
  try {
    const [postResult, userResult, communityResult, organizationResult, activeUserResult] = await Promise.all([
      getNewPostsForDailyStats(),
      getNewUsersForDailyStats(),
      getNewCommunitiesForDailyStats(),
      getNewOrganizationsForDailyStats(),
      getActiveUsersForDailyStats(),
    ])

    console.log(postResult.count, userResult.count, communityResult.count, organizationResult.count, activeUserResult.count)

    const stats = await Stats.create({
      date: new Date().toISOString().split('T')[0],
      newPosts: postResult.count,
      newUsers: userResult.count,
      newCommunities: communityResult.count,
      newOrganizations: organizationResult.count,
      activeUsers: activeUserResult.count,
    })

    return { success: true, message: 'Stats persisted successfully' }

  } catch (error) {
    console.error('Error loading stats:', error)
    return { success: false, message: 'Error persisting stats' }
  }
}

export async function getStatsForPreviousWeek() {
  const start = getSevenDaysAgoFormatted();

  try {
    await connect();
    const stats = await Stats.find({
      date: {
        $gte: start
      }
    })
    return { success: true, stats };
  } catch (error) {
    console.error('Error loading stats:', error)
    return { success: false, message: 'Error loading stats' }
  }
}