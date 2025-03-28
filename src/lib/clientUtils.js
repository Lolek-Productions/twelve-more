"use client"

import Microlink from "@microlink/react";
import {useEffect, useState} from "react";

export const SafeMicrolink = ({ url }) => {
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      // Check that URL has both protocol and hostname and doesn't end with a dot
      if (!parsedUrl.protocol || !parsedUrl.hostname ||
        !parsedUrl.hostname.includes('.') ||
        parsedUrl.hostname.endsWith('.')) {
        throw new Error('Invalid URL format');
      }
      setIsValidUrl(true);
    } catch (e) {
      console.warn('Invalid URL:', url);
      setIsValidUrl(false);
    }
  }, [url]);

  // Don't render anything for invalid URLs
  if (!isValidUrl) {
    return null;
  }

  // For valid URLs, render the Microlink component with string props instead of boolean
  return (
    <Microlink
      url={url}
      size="large"
      contrast="false" // Use string instead of boolean
      media={['image', 'logo']}
      autoPlay="false" // Use string instead of boolean
      lazy={true}
      className="rounded-lg overflow-hidden border border-gray-200"
    />
  );
}