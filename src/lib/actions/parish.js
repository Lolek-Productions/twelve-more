'use server';

import Parish from '@/lib/models/parish.model';
import { connect } from "@/lib/mongodb/mongoose";

export async function getParishes(queryData) {
  console.log('queryData', queryData);
  try {
    const page = queryData ? Number(queryData.page || 1) : 1;
    const limit = queryData ? Number(queryData.limit || 10) : 10;
    const search = queryData ? (queryData.filtering || '').toString() : '';
    const sortField = queryData ? (queryData.sortField || 'name').toString() : 'name';
    const sortOrder = queryData ? (queryData.sortOrder || 'asc').toString() : 'asc';

    // Ensure database connection
    await connect();

    // Construct search filter
    const searchFilter = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { zipcode: { $regex: search, $options: 'i' } }
        ]
      }
      : {};

    // Construct sort object dynamically
    const sortOptions = {
      [sortField]: sortOrder === 'asc' ? 1 : -1
    };

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const totalCount = await Parish.countDocuments(searchFilter);

    // Fetch parishes with pagination and sorting
    const parishes = await Parish.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Convert Mongoose documents to plain objects and format
    const formattedParishes = parishes.map(parish => ({
      id: parish._id.toString(),
      name: parish.name,
      address: parish.address,
      city: parish.city,
      state: parish.state,
      zipcode: parish.zipcode,
      phone: parish.phone,
      createdAt: parish.createdAt ? new Date(parish.createdAt).toISOString() : null,
      updatedAt: parish.updatedAt ? new Date(parish.updatedAt).toISOString() : null,
    }));

    return {
      success: true,
      parishes: formattedParishes,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error('Error getting parishes:', error);
    throw new Error('Failed to fetch parishes');
  }
}

/**
 * Search parishes by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching parishes array
 */
export async function searchParishes(query) {
  try {
    await connect();

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(query, 'i');

    const parishes = await Parish.find({
      $or: [
        { name: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { address: searchRegex },
      ]
    })
      .sort({ name: 1 })
      .limit(50)
      .lean();

    return parishes.map(parish => ({
      id: parish._id.toString(),
      name: parish.name,
      address: parish.address,
      city: parish.city,
      state: parish.state,
      zipcode: parish.zipcode,
      phone: parish.phone,
      createdAt: parish.createdAt ? new Date(parish.createdAt).toISOString() : null,
      updatedAt: parish.updatedAt ? new Date(parish.updatedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error('Error searching parishes:', error);
    throw new Error('Failed to search parishes');
  }
}

export async function getParishesByZipcode(zipcode, limit=10) {
  try {
    await connect();

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(query, 'i');

    const parishes = await Parish.find({zipcode: zipcode})
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    return parishes.map(parish => ({
      id: parish._id.toString(),
      name: parish.name,
      address: parish.address,
      city: parish.city,
      state: parish.state,
      zipcode: parish.zipcode,
      phone: parish.phone,
      createdAt: parish.createdAt ? new Date(parish.createdAt).toISOString() : null,
      updatedAt: parish.updatedAt ? new Date(parish.updatedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error('Error searching parishes:', error);
    throw new Error('Failed to search parishes');
  }
}


/**
 * Get a parish by ID
 * @param {string} id - Parish ID
 * @returns {Promise<Object>} - Parish object
 */
export async function getParishById(id) {
  try {
    await connect();

    const parish = await Parish.findById(id).lean();

    if (!parish) {
      throw new Error('Parish not found');
    }

    return {
      id: parish._id.toString(),
      name: parish.name,
      address: parish.address,
      city: parish.city,
      state: parish.state,
      zipcode: parish.zipcode,
      phone: parish.phone,
      createdAt: parish.createdAt ? new Date(parish.createdAt).toISOString() : null,
      updatedAt: parish.updatedAt ? new Date(parish.updatedAt).toISOString() : null,
    };
  } catch (error) {
    console.error(`Error getting parish with ID ${id}:`, error);
    throw new Error('Failed to fetch parish');
  }
}

/**
 * Count total parishes (useful for pagination)
 * @returns {Promise<number>} - Total number of parishes
 */
export async function countParishes() {
  try {
    await connect();
    return await Parish.countDocuments({});
  } catch (error) {
    console.error('Error counting parishes:', error);
    throw new Error('Failed to count parishes');
  }
}