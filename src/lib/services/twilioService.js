import twilio from 'twilio';

// Centralized Twilio credentials and config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const notifyServiceSid = process.env.TWILIO_NOTIFY_SERVICE_SID;

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

      const message = await client.messages.create({
        body,
        from: twilioPhoneNumber,
        to,
      });
      return { success: true, message: `SMS sent successfully to ${to} (SID: ${message.sid})` };

    } catch (error) {
      console.error('Twilio SMS Error:', error.message);
      return { success: false, message: `Failed to send SMS: ${error.message}` };
    }
  }

  /**
   * Send SMS to multiple recipients using Twilio Notify in a single request
   * @param {string[]} phoneNumbers - Array of phone numbers
   * @param {string} body - Message content
   * @returns {Promise<{ success: boolean, message: string, sid?: string }>}
   */
  async sendBatchSMS(phoneNumbers, body) {
    try {
      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return { success: false, message: 'Phone numbers must be a non-empty array' };
      }

      const validPhoneNumbers = phoneNumbers.filter((phone) => typeof phone === 'string' && phone.trim() !== '');
      if (validPhoneNumbers.length === 0) {
        return { success: false, message: 'No valid phone numbers provided' };
      }

      console.log('Sending to phone numbers:', validPhoneNumbers); // Debug log
      const toBinding = validPhoneNumbers.map((phone) => ({
        binding_type: 'sms',
        address: phone,
      }));

      const requestPayload = {
        toBinding: validPhoneNumbers.map((phone) => JSON.stringify({
          binding_type: 'sms',
          address: phone,
        })),
        body,
        from: twilioPhoneNumber,
      };
      console.log('Full request payload:', requestPayload); // Log before sending

      const notification = await client.notify.v1
        .services(notifyServiceSid)
        .notifications.create(requestPayload);

      return {
        success: true,
        message: `SMS batch sent successfully to ${validPhoneNumbers.length} recipients`,
        sid: notification.sid,
      };
    } catch (error) {
      console.error('Twilio Notify Batch Error:', error.message);
      return { success: false, message: `Failed to send SMS batch: ${error.message}` };
    }
  }
}

const twilioService = new TwilioService();
export default twilioService;