'use server';

import Zipcode from '@/lib/models/zipcode.model';
import { connect } from "@/lib/mongodb/mongoose";

export async function getProximateZipcodes(zipcodeSearch, limit = 12) {
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

    // Find nearby zipcodes using MongoDB's geospatial query
    // This assumes your Zipcode model has a 2dsphere index on geo_point_2d
    const nearbyZipcodes = await Zipcode.find({
      geo_point_2d: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [originLon, originLat] // MongoDB uses [longitude, latitude] order
          },
          $maxDistance: 50000 // 50 km radius, adjust as needed
        }
      },
      // Exclude the origin zipcode from results
      zip_code: { $ne: zipcodeSearch }
    })
      .limit(limit)
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
        .slice(0, limit);
    }

    // Convert Mongoose documents to plain objects and format
    const formattedZipcodes = zipcodes.map(zipcode => {
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

    console.log(`Found ${formattedZipcodes.length} nearby zipcodes`);

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