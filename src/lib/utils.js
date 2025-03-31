import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import Link from 'next/link';
import {toast, useToast} from "@/hooks/use-toast";
import SafeMicrolink from "@/components/SafeMicroLink"

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
