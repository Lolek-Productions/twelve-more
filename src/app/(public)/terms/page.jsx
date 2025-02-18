import Link from "next/link";
import {supportEmailAddress} from "@/lib/utils";

export default function TermsOfService() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-600">Effective Date: 18 Feb 2025</p>
      <p className="text-gray-600 mb-6">Last Updated: 18 Feb 2025</p>

      <h2 className="text-2xl font-semibold mt-6">1. Acceptance of Terms</h2>
      <p className="text-gray-700">
        By accessing or using TwelveMore, you agree to be bound by these Terms of Service and our
        <a href="/privacy" className="text-blue-500"> Privacy Policy</a>.
        If you do not agree, please do not use our services.
      </p>

      <h2 className="text-2xl font-semibold mt-6">2. Use of Our Services</h2>
      <p className="text-gray-700">
        You agree to use TwelveMore in compliance with all applicable laws and regulations. You must not:
      </p>
      <ul className="list-disc list-inside text-gray-700">
        <li>Use the platform for illegal or unauthorized purposes.</li>
        <li>Interfere with or disrupt our services.</li>
        <li>Attempt to access other users’ accounts without permission.</li>
        <li>Post harmful, misleading, or inappropriate content.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">3. User Accounts & Responsibilities</h2>
      <p className="text-gray-700">
        If you create an account, you are responsible for keeping your login credentials secure. TwelveMore is not
        liable for any unauthorized use of your account.
      </p>

      <h2 className="text-2xl font-semibold mt-6">4. Termination</h2>
      <p className="text-gray-700">
        We reserve the right to suspend or terminate your account if you violate these Terms of Service. If your account
        is terminated, you may lose access to your data and services.
      </p>

      <h2 className="text-2xl font-semibold mt-6">5. Limitation of Liability</h2>
      <p className="text-gray-700">
        TwelveMore is provided "as is" without any warranties. We are not liable for any damages, losses, or
        interruptions related to the use of our platform.
      </p>

      <h2 className="text-2xl font-semibold mt-6">6. Changes to These Terms</h2>
      <p className="text-gray-700">
        We may update these Terms from time to time. Continued use of the platform after changes means you accept the
        revised terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6">7. Contact Us</h2>
      <p className="text-gray-700">
        If you have any questions about these Terms of Service, you can contact us at:
      </p>
      <p className="text-gray-700">
        <Link href={`mailto:${supportEmailAddress}`} className="text-blue-500">{supportEmailAddress}</Link>
      </p>
    </div>
  );
}