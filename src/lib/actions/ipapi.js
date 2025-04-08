'use server';

// This server action accepts the IP address from the client
export async function getLocationData(ip) {
  try {
    // Get the API key from server-side environment variables
    const apiKey = process.env.IP_API_KEY;

    if (!apiKey) {
      throw new Error('Missing API key for IP geolocation service');
    }

    if (!ip) {
      throw new Error('IP address is required');
    }

    // Use the provided IP to fetch location data
    const url = `https://api.ipapi.is?q=${ip}&key=${apiKey}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      location: data.location
    };
  } catch (error) {
    console.error('Error in getLocationData server action:', error);
    return {
      success: false,
      error: error.message
    };
  }
}