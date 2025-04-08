'use client';

import { useState, useEffect } from 'react';
import { getLocationData } from '@/lib/actions/ipapi.js';

export default function LookupIp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);

        // First get the IP address from the browser
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        const result = await getLocationData(ip);

        console.log(result);

        if (result.success) {
          setLocationData(result.location);
        } else {
          throw new Error(result.error || 'Failed to retrieve location data');
        }
      } catch (err) {
        console.error('Error fetching zip code:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Location</h2>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Detecting your location...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 py-2">
          Error: {error}
        </div>
      )}

      {!loading && !error && locationData && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Zip/Postal Code:</span>
            <span>{locationData.zip || 'Not available'}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">City:</span>
            <span>{locationData.city || 'Not available'}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">State:</span>
            <span>{locationData.state || 'Not available'}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Country:</span>
            <span>{locationData.country || 'Not available'}</span>
          </div>
        </div>
      )}
    </div>
  );
};