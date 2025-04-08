'use server';

export async function getLocationData() {
  try {
    // Get the API key from server-side environment variables
    const apiKey = process.env.IP_API_KEY;

    if (!apiKey) {
      throw new Error('Missing API key for IP geolocation service');
    }

    // We'll need to get the IP from the request headers
    // In a real server action, you'd use the headers() function from next/headers
    // However, this requires the action to be called from a Server Component
    // For this example, we're using a public IP detection API as a fallback
    const ipResponse = await fetch('https://api.ipify.org?format=json');

    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // Use the IP to fetch location data
    const url = `https://api.ipapi.is?q=${ip}&key=${apiKey}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // console.log('ipapi data:', data);

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