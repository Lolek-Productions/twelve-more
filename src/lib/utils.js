import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import Link from 'next/link';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const supportEmailAddress = 'fr.josh@lolekproductions.org';

// lib/utils.js
import {toast, useToast} from "@/hooks/use-toast";
import {NextResponse} from "next/server";

/**
 * Handles API response with try-catch, toast notifications, and optional callbacks.
 * @param {Promise} apiCall - The API call promise to execute
 * @param {Object} options - Configuration options
 * @param {string} [options.successTitle="Success"] - Title for success toast
 * @param {string} options.successDescription - Description for success toast
 * @param {string} [options.errorTitle="Error"] - Title for error toast
 * @param {string} options.errorDescription - Default error description if no specific error
 * @param {Function} [options.onSuccess] - Optional callback on success
 * @param {Function} [options.onError] - Optional callback on error
 * @returns {Promise} - Resolves with the API response or throws an error
 */
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
      return { success: false, error: response?.error || errorDescription };
    }
  } catch (error) {
    console.error(`${errorTitle}:`, error);
    toast({
      variant: "destructive",
      title: errorTitle,
      description: errorDescription,
    });
    if (onError) onError(error);
    return { success: false, error: errorDescription, details: error.message };
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

export const handleClerkError = (error) => {
  console.error(
    'Error:',
    JSON.stringify(
      {
        status: error.status,
        message: error.message,
        errors: error.errors,
        clerkTraceId: error.clerkTraceId,
      },
      null,
      2
    )
  );

  const errorDetails = error.errors?.map((err) => ({
    code: err.code,
    message: err.message,
    longMessage: err.longMessage || err.message,
  })) || [{ message: error.message || 'Unknown error' }];

  return NextResponse.json(
    { error: 'Failed to process request', details: errorDetails },
    { status: error.status || 500 }
  );
};

export function linkifyText(text) {
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

  const showErrorToast = (message = "An unexpected error occurred") => {
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

/**
 * Truncates a string if it exceeds the specified maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum allowed length before truncation
 * @param {string} suffix - String to append after truncation (default: "...")
 * @return {string} The truncated string or original if shorter than maxLength
 */
export function truncateText(text, maxLength = 50, suffix = "...") {
  // Handle empty, null or undefined text
  if (!text) return "";

  // If text is shorter than or equal to maxLength, return it as is
  if (text.length <= maxLength) return text;

  // Otherwise truncate and add suffix
  return `${text.substring(0, maxLength)}${suffix}`;
}