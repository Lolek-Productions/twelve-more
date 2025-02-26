"use server";

import twilioService from '@/lib/services/twilioService';

export async function sendSMS({ phoneNumber, message }) {
  try {
    if (!phoneNumber || !message) {
      return {
        success: false,
        error: 'Phone number and message are required',
      };
    }

    const result = await twilioService.sendSMS(phoneNumber, message);

    return {
      success: result.success,
      error: result.success ? null : result.message,
      message: result.success ? result.message : null,
    };
  } catch (error) {
    console.error('Error in sendSMS server action:', error.message);
    return {
      success: false,
      error: `Failed to send SMS: ${error.message}`,
    };
  }
}