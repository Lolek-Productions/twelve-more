'use server'

import { connect } from '../mongodb/mongoose';
import { requireUser } from "@/lib/auth"
import Post from '../models/post.model';
import Community from '../models/community.model';

export async function getTopCommunities({ startDate, endDate } = {}) {
  try {
    await requireUser()
    await connect();

    // Set date ranges properly
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));

    const end = endDate
      ? new Date(endDate)
      : new Date();

    // If dates were provided, adjust them to beginning/end of day
    if (startDate) {
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      end.setUTCHours(23, 59, 59, 999);
    }

    // console.log("Date range:", start, end);

    // Query using MongoDB's aggregation pipeline with the CORRECT field name
    const topCommunities = await Post.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end
          },
          // parentId: null,
          community: { $exists: true, $ne: null } // Changed from communityId to community
        }
      },
      {
        $group: {
          _id: "$community", // Changed from $communityId to $community
          posts: { $sum: 1 }
        }
      },
      {
        $sort: { posts: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // console.log('topCommunities', topCommunities);

    // If no communities found, return early with a message
    if (!topCommunities || topCommunities.length === 0) {
      return {
        success: false,
        message: "No communities found with posts in the specified date range"
      };
    }

    // Get community IDs from aggregation results
    const communityIds = topCommunities.map(item => item._id);

    // Fetch community details
    const communities = await Community.find({
      _id: { $in: communityIds }
    }, {
      _id: 1,
      name: 1
    });

    // Create a map of community ID to name
    const communityMap = communities.reduce((acc, community) => {
      acc[community._id.toString()] = community.name;
      return acc;
    }, {});

    // Format data for chart display
    const chartData = topCommunities.map(item => ({
      communityName: communityMap[item._id.toString()] || `Community ${item._id}`,
      posts: item.posts
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error("Error fetching top communities:", error);
    return {
      success: false,
      message: "Failed to fetch top communities: " + error.message,
    };
  }
}