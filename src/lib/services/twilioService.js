import twilio from 'twilio';

// Centralized Twilio credentials and config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

// Validate credentials once at initialization
if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Twilio configuration is missing in environment variables');
}

const client = twilio(accountSid, authToken);

// Twilio Service class
class TwilioService {
  /**
   * Send an SMS message
   * @param {string} to - Recipient phone number (e.g., '+12345678901')
   * @param {string} body - Message content
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async sendSMS(to, body) {
    try {
      if (!to) {
        return { success: false, message: 'Recipient phone number is required' };
      }

      if (isProduction) {
        const message = await client.messages.create({
          body,
          from: twilioPhoneNumber,
          to,
        });
        return { success: true, message: `SMS sent successfully to ${to} (SID: ${message.sid})` };
      } else {
        console.log(`[DEV] Simulated SMS to ${to}: "${body}"`);
        return { success: true, message: `Simulated SMS to ${to} (dev mode)` };
      }

    } catch (error) {
      console.error('Twilio SMS Error:', error.message);
      return { success: false, message: `Failed to send SMS: ${error.message}` };
    }
  }
}

// Export a singleton instance
const twilioService = new TwilioService();
export default twilioService;