'use server';

import Zipcode from '@/lib/models/zipcode.model';
import Parish from '@/lib/models/parish.model';
import { connect } from "@/lib/mongodb/mongoose";

export async function getProximateZipcodes(zipcodeSearch, limit = 12, includeOriginal = true) {
  try {
    // Ensure database connection
    await connect();

    console.log('Search zipcode:', zipcodeSearch);

    // Find the origin zipcode first
    const originZipcode = await Zipcode.findOne({ zip_code: zipcodeSearch }).lean();

    // If no origin zipcode is found, return empty results
    if (!originZipcode) {
      console.log('Origin zipcode not found');
      return {
        success: false,
        zipcodes: [],
        message: 'Zipcode not found'
      };
    }

    console.log('Origin zipcode found:', originZipcode.zip_code);

    // Get the origin coordinates
    const originLat = originZipcode.geo_point_2d.lat;
    const originLon = originZipcode.geo_point_2d.lon;

    // Adjust limit for nearby zipcodes if we're including the original
    // We'll need one less nearby zipcode if we're including the original
    const nearbyLimit = includeOriginal ? limit - 1 : limit;

    // Find nearby zipcodes using MongoDB's geospatial query
    const nearbyZipcodes = await Zipcode.find({
      geo_point_2d: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [originLon, originLat] // MongoDB uses [longitude, latitude] order
          },
          $maxDistance: 70000 // 50 km radius, adjust as needed: 50000
        }
      },
      // Exclude the origin zipcode from results
      zip_code: { $ne: zipcodeSearch }
    })
      .limit(nearbyLimit)
      .lean();

    // If geospatial query doesn't work (perhaps no 2dsphere index), fallback to manual calculation
    let zipcodes = nearbyZipcodes;
    if (!zipcodes || zipcodes.length === 0) {
      console.log('Falling back to manual distance calculation');

      // Get all zipcodes
      const allZipcodes = await Zipcode.find({
        zip_code: { $ne: zipcodeSearch } // Exclude origin zipcode
      }).lean();

      // Calculate distance for each zipcode
      const zipcodesWithDistance = allZipcodes.map(zipcode => {
        const distance = calculateDistance(
          originLat,
          originLon,
          zipcode.geo_point_2d.lat,
          zipcode.geo_point_2d.lon
        );
        return { ...zipcode, distance };
      });

      // Sort by distance and take the limit
      zipcodes = zipcodesWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, nearbyLimit);
    }

    // Format the zipcodes
    let formattedZipcodes = zipcodes.map(zipcode => {
      // Calculate distance if not already calculated
      const distance = zipcode.distance ||
        calculateDistance(
          originLat,
          originLon,
          zipcode.geo_point_2d.lat,
          zipcode.geo_point_2d.lon
        );

      return {
        id: zipcode._id.toString(),
        name: zipcode.zip_code,
        description: `${zipcode.usps_city || 'Unknown City'}, ${Math.round(distance * 10) / 10} miles away`,
        zip_code: zipcode.zip_code,
        usps_city: zipcode.usps_city,
        geo_point_2d: {
          lat: zipcode.geo_point_2d.lat,
          lon: zipcode.geo_point_2d.lon
        },
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });

    // Add the original zipcode to the results if requested
    if (includeOriginal) {
      const formattedOriginZipcode = {
        id: originZipcode._id.toString(),
        name: originZipcode.zip_code,
        description: `${originZipcode.usps_city || 'Unknown City'} (Your location)`,
        zip_code: originZipcode.zip_code,
        usps_city: originZipcode.usps_city,
        geo_point_2d: {
          lat: originZipcode.geo_point_2d.lat,
          lon: originZipcode.geo_point_2d.lon
        },
        distance: 0, // Distance is 0 since this is the origin
        isOrigin: true // Flag to identify this as the origin zipcode
      };

      // Add the origin zipcode to the beginning of the array
      formattedZipcodes = [formattedOriginZipcode, ...formattedZipcodes];
    }

    console.log(`Returning ${formattedZipcodes.length} zipcodes (including original: ${includeOriginal})`);

    return {
      success: true,
      zipcodes: formattedZipcodes,
    };
  } catch (error) {
    console.error('Error getting zipcodes:', error);
    throw new Error('Failed to fetch zipcodes: ' + error.message);
  }
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;

  // Earth radius in miles
  const earthRadius = 3958.8; // miles (use 6371 for kilometers)

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance;
}

export async function getProximateParishesByZipcode(zipcodeSearch, limit = 12) {
  try {
    // Ensure database connection
    await connect();

    console.log('Searching for parishes near zipcode:', zipcodeSearch);

    // Step 1: Get nearby zipcodes using the existing function
    // We'll get more zipcodes than needed as we don't know how many parishes each contains
    const zipcodesResult = await getProximateZipcodes(zipcodeSearch, 70);
    console.log('zipcode count', zipcodesResult.zipcodes.length)

    if (!zipcodesResult.success || zipcodesResult.zipcodes.length === 0) {
      return {
        success: false,
        parishes: [],
        message: zipcodesResult.message || 'No nearby zipcodes found'
      };
    }

    const nearbyZipcodes = zipcodesResult.zipcodes;

    console.log(`Found ${nearbyZipcodes.length} nearby zipcodes to search for parishes`);

    // Step 2: Search for parishes in each zipcode until we have enough
    const foundParishes = [];
    const processedZipcodes = new Set();

    // Loop through each zipcode
    for (const zipcode of nearbyZipcodes) {
      // Skip if we already have enough parishes
      if (foundParishes.length >= limit) break;

      // Skip if we've already processed this zipcode
      if (processedZipcodes.has(zipcode.zip_code)) continue;

      processedZipcodes.add(zipcode.zip_code);

      // Find parishes in this zipcode
      const parishesInZipcode = await Parish.find({
        zipcode: zipcode.zip_code
      }).lean();

      if (parishesInZipcode.length > 0) {
        console.log(`Found ${parishesInZipcode.length} parishes in zipcode ${zipcode.zip_code}`);

        // Process each parish
        for (const parish of parishesInZipcode) {
          // Skip if we already have enough parishes
          if (foundParishes.length >= limit) break;

          // Check if this parish is already in our results (by ID)
          const isDuplicate = foundParishes.some(p => p.id === parish._id.toString());

          if (!isDuplicate) {
            // Add distance information from the zipcode
            foundParishes.push({
              id: parish._id.toString(),
              name: parish.name,
              description: parish.description || `${parish.city || ''}, ${parish.state || ''}`,
              distance: zipcode.distance,
              zipcode: zipcode.zip_code,
              city: parish.city || zipcode.usps_city,
              // Add any other parish fields you need
            });
          }
        }
      }
    }

    // Sort parishes by distance
    const sortedParishes = foundParishes.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${sortedParishes.length} unique parishes in nearby zipcodes`);

    return {
      success: true,
      parishes: sortedParishes.slice(0, limit),
      total: sortedParishes.length
    };

  } catch (error) {
    console.error('Error getting proximate parishes:', error);
    throw new Error('Failed to fetch parishes by zipcode: ' + error.message);
  }
}