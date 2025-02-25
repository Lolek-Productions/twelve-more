"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sendSMS } from '@/lib/actions/sms'; // Import server action

export default function SendSMSForm() {
  const [phoneNumber, setPhoneNumber] = useState('+12708831110');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const result = await sendSMS({ phoneNumber, message });

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setMessage('');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }

    setIsSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., +12709858824"
          required
          disabled={isSending}
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
          disabled={isSending}
        />
      </div>
      <Button type="submit" disabled={isSending || !phoneNumber || !message}>
        {isSending ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}