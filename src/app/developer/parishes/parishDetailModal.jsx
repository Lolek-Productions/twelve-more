"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MapPin } from "lucide-react";

export default function ParishDetailModal({ parish, open, onClose }) {
  if (!parish) return null;

  // Format the address for Google Maps URL
  const formattedAddress = encodeURIComponent(
    `${parish.address || ''}, ${parish.city || ''}, ${parish.state || ''} ${parish.zipcode || ''}`
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{parish.name}</DialogTitle>
          <DialogDescription>
            {parish.city}, {parish.state} {parish.zipcode}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Contact Information</h3>

            {parish.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p>{parish.address}</p>
                  <p>
                    {parish.city}, {parish.state} {parish.zipcode}
                  </p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            )}

            {parish.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <p>{parish.phone}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}