import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import Link from 'next/link';
import {toast, useToast} from "@/hooks/use-toast";
import {NextResponse} from "next/server";
import {SafeMicrolink} from "@/lib/clientUtils.js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const supportEmailAddress = 'fr.josh@lolekproductions.org';

//TODO: remove
export const handleApiResponse = async ({
                                          apiCall,
                                          successTitle = "Success",
                                          successDescription,
                                          errorTitle = "Error",
                                          errorDescription = "An error occurred",
                                          onSuccess,
                                          onError,
                                        }) => {
  try {
    const response = await apiCall;

    // Check if response is an object with a 'success' property
    if (!response || typeof response !== "object" || !("success" in response)) {
      throw new Error("API response must be an object with a 'success' property");
    }

    if (response.success) {
      toast({
        title: successTitle,
        description: successDescription,
      });
      if (onSuccess) onSuccess(response);
      return response; // Raw API success response
    } else {
      toast({
        variant: "destructive",
        title: errorTitle,
        description: response?.error || errorDescription,
      });
      if (onError) onError(response?.error);
      return { success: false, message: response?.error || errorDescription };
    }
  } catch (error) {
    console.error(`${errorTitle}:`, error);
    toast({
      variant: "destructive",
      title: errorTitle,
      description: errorDescription,
    });
    if (onError) onError(error);
    return { success: false, message: errorDescription, details: error.message };
  }
};

export const normalizePhoneNumber = (phoneNumber) => {
  console.log(phoneNumber);

  // Convert to string and remove non-digit characters
  const digitsOnly = String(phoneNumber).replace(/\D/g, '');

  // If it's a 10-digit US number, prepend +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`; // e.g., 2708831110 -> +12708831110
  }

  // If it's already in E.164 format with country code (e.g., +12708831110), return as-is
  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    return `+${digitsOnly}`; // e.g., 12708831110 -> +12708831110
  }
  if (digitsOnly.startsWith('+1') && digitsOnly.length === 12) {
    return digitsOnly; // e.g., +12708831110 -> +12708831110
  }

  console.log('digitsOnly',digitsOnly)

  // Throw an error for invalid formats
  throw new Error('Invalid phone number format. Please provide a 10-digit US number (e.g., 2708831110)');
};

export function linkifyText(text) {
  if(!text) return;

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text into parts based on URLs
  const parts = text.split(urlRegex);

  // Map through the parts and wrap URLs in Link components
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <Link key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {part}
        </Link>
      );
    }
    return part;
  });
}

export const useApiToast = () => {
  const { toast } = useToast();

  const showResponseToast = (response) => {
    toast({
      variant: response.success ? "default" : "destructive",
      title: response.success ? "Success" : "Error",
      description: response.message
    });
  };

  const showErrorToast = (error = "An unexpected error occurred") => {
    // Handle different error types (string, Error object, etc.)
    const errorMessage = error instanceof Error
      ? error.message
      : (typeof error === 'string' ? error : "An unexpected error occurred");

    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage
    });
  };

  return { showResponseToast, showErrorToast };
};

export function truncateText(text, maxLength = 50, suffix = "...") {
  // Handle empty, null or undefined text
  if (!text) return "";

  // If text is shorter than or equal to maxLength, return it as is
  if (text.length <= maxLength) return text;

  // Otherwise truncate and add suffix
  return `${text.substring(0, maxLength)}${suffix}`;
}

export const extractUrls = (text) => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];

  // Filter out invalid URLs
  return matches.filter(url => {
    try {
      // Check if URL is valid by attempting to create a URL object
      // and checking that it has both protocol and hostname
      const parsedUrl = new URL(url);
      return parsedUrl.protocol && parsedUrl.hostname &&
        // Ensure the hostname has at least one dot and doesn't end with a dot
        parsedUrl.hostname.includes('.') &&
        !parsedUrl.hostname.endsWith('.');
    } catch (e) {
      return false;
    }
  });
};

export const renderPostText = ({post, clickableText}) => {
  // If not clickable text, just use the linkifyText utility
  if (!clickableText) {
    return (
      <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
         style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
        {linkifyText(post?.text) || 'No text available'}
      </p>
    );
  }

  // If no text, or no links detected, render as normal clickable text
  if (!post?.text || !post.text.includes('http')) {
    return (
      <Link href={`/posts/${post?.id}`} className="block w-full">
        <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
           style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {post?.text || 'No text available'}
        </p>
      </Link>
    );
  }

  // Extract URLs using a regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = post.text.split(urlRegex);
  const urls = extractUrls(post.text);

  return (
    <div>
      <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
         style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {parts.map((part, index) => {
          // Check if this part is a URL
          if (part.match(urlRegex)) {
            // This is a URL - make it a clickable link that stops propagation
            return (
              <a
                key={index}
                href={part}
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part}
              </a>
            );
          } else {
            // This is regular text - make it clickable to the post
            return (
              <Link
                key={index}
                href={`/posts/${post?.id}`}
                className="inline"
              >
                {part}
              </Link>
            );
          }
        })}
      </p>

      {/* Render Microlink components for each URL found in the text */}
      {urls.length > 0 && urls.map((url, index) => (
        <div
          key={`microlink-${index}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 mb-3"
        >
          <SafeMicrolink url={url} />
        </div>
      ))}
    </div>
  );
};