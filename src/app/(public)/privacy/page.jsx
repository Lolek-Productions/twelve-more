import Link from 'next/link';
import { supportEmailAddress } from "@/lib/utils";

export default function Privacy() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-600">Effective Date: 18 Feb 2025</p>
      <p className="text-gray-600 mb-6">Last Updated: 19 Feb 2025</p>

      <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
      <p className="text-gray-700">
        We collect several types of information to provide and improve our services:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li><strong>Account Information:</strong> When you sign up, we collect your name, email, phone number, and other necessary details to enable account creation and SMS notifications.</li>
        <li><strong>Usage Data:</strong> We track how you interact with the platform, including pages visited and actions taken.</li>
        <li><strong>Device Information:</strong> Your IP address, browser type, and device details may be logged automatically.</li>
        <li><strong>Cookies & Tracking:</strong> We use cookies to enhance your experience and analyze user activity.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
      <p className="text-gray-700">
        We use the collected data for the following purposes:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li>To provide and improve TwelveMore's services, including sending SMS notifications, event reminders, and engagement prompts to keep you connected with your faith community.</li>
        <li>To personalize user experience and suggest relevant content.</li>
        <li>To enhance security, prevent fraud, and detect unauthorized activity.</li>
        <li>To send notifications, updates, and marketing materials (you may opt out at any time).</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">3. How We Share Your Information</h2>
      <p className="text-gray-700">
        We <strong>do not sell</strong> your personal data. However, we may share information in the following cases:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li><strong>With Service Providers:</strong> We work with third-party vendors for hosting, analytics, payments, and SMS delivery (e.g., Twilio). These providers are bound by strict confidentiality agreements.</li>
        <li><strong>For Legal Reasons:</strong> If required by law or to protect our rights and users.</li>
        <li><strong>With Your Consent:</strong> We will ask for your permission before sharing sensitive data.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">4. Your Rights & Choices</h2>
      <p className="text-gray-700">
        Depending on your location, you may have the right to:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate or outdated information.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Opt out of SMS notifications or marketing communications by replying “STOP” to any message or contacting us.</li>
      </ul>
      <p className="text-gray-700">
        To exercise these rights, contact us at <Link href={`mailto:${supportEmailAddress}`} className="text-blue-500">{supportEmailAddress}</Link>.
      </p>
      <p className="text-gray-700">
        <strong>SMS Opt-Out:</strong> You may opt out of SMS notifications at any time by replying “STOP” to any message. After opting out, you will receive a confirmation message and no further messages unless you resubscribe.
      </p>

      <h2 className="text-2xl font-semibold mt-6">5. Data Security & Retention</h2>
      <p className="text-gray-700">
        We implement strong security measures to protect your information, but no system is 100% secure. We retain your data, including phone numbers, as long as necessary to provide our services or comply with legal requirements. If you opt out of SMS notifications, your phone number will be removed from our messaging list within 10 business days, unless required for legal purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-6">6. Third-Party Links & Services</h2>
      <p className="text-gray-700">
        TwelveMore may link to third-party websites. We are not responsible for their privacy policies, and we encourage you to review their terms separately.
      </p>

      <h2 className="text-2xl font-semibold mt-6">7. Updates to This Privacy Policy</h2>
      <p className="text-gray-700">
        We may update this policy periodically. If significant changes occur, we will notify you via email, within the platform, or via SMS if applicable.
      </p>

      <h2 className="text-2xl font-semibold mt-6">8. SMS Notifications and Mobile Information Protection</h2>
      <p className="text-gray-700">
        <strong>SMS Usage:</strong> TwelveMore collects your phone number to send SMS notifications, reminders, and engagement prompts related to your parish or small group (e.g., meeting updates, prayer requests, event RSVPs). <strong>Message and data rates may apply.</strong>
      </p>
      <p className="text-gray-700">
        <strong>Consent:</strong> During account registration, you explicitly consent to receive SMS notifications by agreeing to the statement: “I agree to receive SMS notifications from TwelveMore. Message & data rates may apply. Reply STOP to unsubscribe.” This is a mandatory step in onboarding.
      </p>
      <p className="text-gray-700">
        <strong>Non-Sharing:</strong> TwelveMore does not share, sell, or disclose your phone number or mobile information to third parties or affiliates for marketing or promotional purposes. Mobile data is used strictly for essential app functionality, security, and user experience enhancements.
      </p>
      <p className="text-gray-700">
        <strong>Opt-Out:</strong> Reply “STOP” to any message to unsubscribe. For assistance, reply “HELP” or contact <Link href={`mailto:${supportEmailAddress}`} className="text-blue-500">{supportEmailAddress}</Link>.
      </p>

      <h2 className="text-2xl font-semibold mt-6">9. Contact Us</h2>
      <p className="text-gray-700">
        If you have any questions or concerns about this Privacy Policy, contact us at:
      </p>
      <p className="text-gray-700">
        <Link href={`mailto:${supportEmailAddress}`} className="text-blue-500">{supportEmailAddress}</Link>
      </p>
    </div>
  );
}