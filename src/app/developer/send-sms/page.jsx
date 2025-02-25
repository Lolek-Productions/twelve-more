"use client";

import SendSMSForm from "@/app/developer/send-sms/send-sms-form";

export default function SendSMSPage() {
  return (
    <div>
      <div className="space-y-0.5">
        <h3 className="text-lg font-medium">Send Test SMS</h3>
        <p className="text-sm text-muted-foreground">
          Send a test SMS using Twilio for development purposes.
        </p>
      </div>
      <div className="mt-6 max-w-xl">
        <SendSMSForm />
      </div>
    </div>
  );
}