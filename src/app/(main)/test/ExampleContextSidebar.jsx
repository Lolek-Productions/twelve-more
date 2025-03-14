"use client";

export default function ExampleContextComponent({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">Page Context</div>

      <div className="p-4 flex-1 overflow-auto">
        <h3 className="text-lg font-medium mb-3">About This Section</h3>
        <p className="mb-4">
          This content appears in two places:
        </p>

        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>As the right column on desktop screens</li>
          <li>In a slide-out sheet on mobile screens</li>
        </ul>

        <h3 className="text-lg font-medium mb-3">Important Details</h3>
        <p className="mb-4">
          This is where you can provide context-specific information, help text,
          related links, or other supporting content for the current page.
        </p>

        <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mb-4">
          <h4 className="font-medium text-blue-700 mb-1">Pro Tip</h4>
          <p className="text-blue-600 text-sm">
            You can customize this content for each different page in your application.
          </p>
        </div>

        {onClose && (
          <div className="mt-6 md:hidden">
            <button
              className="text-primary hover:underline"
              onClick={onClose}
            >
              Close Context Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}