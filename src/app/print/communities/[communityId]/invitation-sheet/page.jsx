import WelcomeCardsPDF from '@/components/WelcomeCardsPDF';
import { Suspense } from 'react';

export default function WelcomeCardsPage() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto">
        <Suspense fallback={<div className="text-center">Loading generator...</div>}>
          <WelcomeCardsPDF />
        </Suspense>

        <div className="mt-8 max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Instructions:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the "Generate PDF" button to create your welcome cards</li>
            <li>The PDF will download automatically</li>
            <li>Print the PDF on letter-sized paper (8.5" × 11")</li>
            <li>Cut to separate each cards</li>
            <li>20 cards will be generated on a single page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
