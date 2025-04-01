"use client"

import React, { useEffect, useState } from "react";
import Microlink from "@microlink/react";

export default function SafeMicrolink({ url }) {
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  // Clean URL by trimming and removing trailing periods
  const cleanUrl = (inputUrl) => {
    let cleaned = inputUrl.trim();
    while (cleaned.endsWith('.')) {
      cleaned = cleaned.slice(0, -1);
    }
    return cleaned;
  };

  const cleanedUrl = cleanUrl(url);

  useEffect(() => {
    try {
      // Reset state on URL change
      setShouldRender(false);

      // Validate URL
      const parsedUrl = new URL(cleanedUrl);
      // Check that URL has both protocol and hostname
      if (
        !parsedUrl.protocol ||
        !parsedUrl.hostname ||
        !parsedUrl.hostname.includes('.')
      ) {
        throw new Error('Invalid URL format');
      }

      setIsValidUrl(true);

      // Small delay to prevent flash of raw URL
      // before Microlink has a chance to initialize
      setTimeout(() => {
        setShouldRender(true);
      }, 50);

    } catch (e) {
      console.warn('Invalid URL:', cleanedUrl);
      setIsValidUrl(false);
    }
  }, [cleanedUrl]);

  // Don't render anything for invalid URLs
  if (!isValidUrl || !shouldRender) {
    return null;
  }

  return (
    <div className="w-full">
      {url &&
        <Microlink
          url={cleanedUrl}
          size="large"
          media={['image', 'logo']}
          autoPlay="false"
          lazy={true}
          className="rounded-lg overflow-hidden border border-gray-200 w-full"
        />
      }
    </div>
  );
};
