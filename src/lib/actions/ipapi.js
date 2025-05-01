'use server';

// This server action accepts the IP address from the client
export async function getLocationData(ip) {
  try {
    // Get the API key from server-side environment variables
    const apiKey = process.env.IPSTACK_API_KEY;

    if (!apiKey) {
      throw new Error('Missing API key for IP geolocation service');
    }

    if (!ip) {
      throw new Error('IP address is required');
    }

    // Use the provided IP to fetch location data
    const url = `http://api.ipstack.com/${ip}?access_key=${apiKey}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    console.log('data', data);

    // Normalize the ipstack response to match frontend expectations
    const normalizedLocation = {
      zip: data.zip,
      city: data.city,
      state: data.region_name,
      country: data.country_name
    };
    return {
      success: true,
      location: normalizedLocation
    };
  } catch (error) {
    console.error('Error in getLocationData server action:', error);
    return {
      success: false,
      error: error.message
    };
  }
}