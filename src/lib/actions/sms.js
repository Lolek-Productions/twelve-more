"use server";

import twilioService from '@/lib/services/twilioService';

export async function sendSMS({ phoneNumber, message }) {
  try {
    if (!phoneNumber || !message) {
      return {
        success: false,
        messsage:'Phone number and message are required',
      };
    }

    const result = await twilioService.sendSMS(phoneNumber, message);

    return {
      success: result.success,
      message: result.success ? result.message : null,
    };
  } catch (error) {
    console.error('Error in sendSMS server action:', error.message);
    return {
      success: false,
      messsage:`Failed to send SMS: ${error.message}`,
    };
  }
}