'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Margin, Resolution, usePDF } from 'react-to-pdf';
import { useParams } from "next/navigation";
import { getCommunityById } from '@/lib/actions/community.js';
import {PUBLIC_APP_URL} from "@/lib/constants.js";

// Dynamically import QRCodeSVG with no SSR to avoid hydration issues
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then(mod => mod.QRCodeSVG),
  { ssr: false }
);

const WelcomeCardsPDF = () => {
  const params = useParams();
  const communityId = params.communityId;

  // State for community data
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        // Replace with your actual server action
        const communityData = await getCommunityById(communityId);

        setCommunity(communityData.community);
        setError(null);
      } catch (err) {
        console.error("Error fetching community:", err);
        setError("Failed to load community data");
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  // Set up the PDF options
  const { toPDF, targetRef: pdfTargetRef } = usePDF({
    filename: community ? `${community.name.toLowerCase().replace(/\s+/g, '-')}-welcome-cards.pdf` : 'welcome-cards.pdf',
    page: {
      format: 'letter',
      orientation: 'portrait',
      margin: Margin.SMALL
    },
    resolution: Resolution.NORMAL
  });

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      await toPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // QR code URL based on community data
  const qrCodeURL = `${PUBLIC_APP_URL}/join/${community?.id}`;

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4 text-center">Loading community data...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome Cards for {community?.name || 'No Community Found'}</h1>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {isGenerating ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* PDF Content Container */}
      <div
        ref={pdfTargetRef}
        className="w-[8.5in] h-[11in] bg-white mx-auto shadow-md p-[0.25in] box-border"
      >
        {/* Explicitly force a two-column layout with 10 rows */}
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)',
          gap: '0.4rem',
          height: '100%'
        }}>
          {/* Generate 20 cards (10 rows, 2 columns) */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center p-2">
              <div className="flex-none w-20 mr-1">
                <QRCodeSVG
                  value={qrCodeURL}
                  size={50}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[18px] mb-0">{community?.name}</p>
                <p className="text-[14px] mb-0.5">Join our community at 12More.co</p>
                <p className="text-[11px] mb-0">Scan the QR code to become a part</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeCardsPDF;