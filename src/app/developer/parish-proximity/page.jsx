'use client';

import React, { useState } from 'react';
import {getProximateParishesByZipcode} from "@/lib/actions/zipcode.js";

export default function SearchComponent() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSearch(formData) {
    setIsLoading(true);
    setSubmitted(true);

    const query = formData.get('query');
    console.log('Search query:', query);

    try {
      const searchResults = await getProximateParishesByZipcode(query);
      console.log('Search results:', searchResults);

      setResults(searchResults.parishes);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Get Nearest Parishes to Zipcode</h1>

      {/* Form using the server action */}
      <form action={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="query"
            placeholder="Search for items..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results section */}
      {submitted && (
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading results...</div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Search Results ({results?.length})</h2>
              <ul className="space-y-4">
                {results.map((item) => (
                  <li key={item.id} className="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                    <h3 className="font-medium text-lg">Name: {item.name}</h3>
                    <h3 className="font-medium text-lg">City: {item.city}</h3>
                    <h3 className="font-medium text-lg">State: {item.state}</h3>
                    <h3 className="font-medium text-lg">Zipcode: {item.zipcode}</h3>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  );
}