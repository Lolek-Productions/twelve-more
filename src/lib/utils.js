import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const supportEmailAddress = 'fr.josh@lolekproductions.org';

// lib/utils.js
import { toast } from "@/hooks/use-toast";

/**
 * Handles API response with try-catch, toast notifications, and optional callbacks.
 * @param {Promise} apiCall - The API call promise to execute
 * @param {Object} options - Configuration options
 * @param {string} [options.successTitle="Success"] - Title for success toast
 * @param {string} options.successDescription - Description for success toast
 * @param {string} [options.errorTitle="Error"] - Title for error toast
 * @param {string} options.defaultErrorDescription - Default error description if no specific error
 * @param {Function} [options.onSuccess] - Optional callback on success
 * @param {Function} [options.onError] - Optional callback on error
 * @returns {Promise} - Resolves with the API response or throws an error
 */
export const handleApiResponse = async ({
                                          apiCall,
                                          successTitle = "Success",
                                          successDescription,
                                          errorTitle = "Error",
                                          defaultErrorDescription = "An error occurred",
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
        description: response?.error || defaultErrorDescription,
      });
      if (onError) onError(response?.error);
      return { success: false, error: response?.error || defaultErrorDescription };
    }
  } catch (error) {
    console.error(`${errorTitle}:`, error);
    toast({
      variant: "destructive",
      title: errorTitle,
      description: defaultErrorDescription,
    });
    if (onError) onError(error);
    return { success: false, error: defaultErrorDescription, details: error.message };
  }
};