'use server'

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import ZipCode from '@/lib/models/zipcode.model.js';

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script:
// node scripts/import-zip-codes.js

export async function importZipCodes() {
  const filePath = "./scripts/georef-united-states-of-america-zc-point.json";

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'twelve-more-app',
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
      });
      console.log('Connected to MongoDB');
    }

    // Clear existing data if needed (optional)
    // Uncomment this if you want to start with a fresh collection
    // await ZipCode.deleteMany({});
    // console.log('Cleared existing ZIP code data');

    // Read and parse JSON file
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf8');
    const zipCodeData = JSON.parse(fileContent);

    console.log(`Found ${zipCodeData.length} ZIP codes to import`);

    // Process in batches to avoid memory issues
    const batchSize = 500; // Reasonable batch size for insertMany
    let processed = 0;

    for (let i = 0; i < zipCodeData.length; i += batchSize) {
      const batch = zipCodeData.slice(i, i + batchSize);

      try {
        // Use insertMany for efficient batch insertion
        // Set ordered: false to continue processing even if some inserts fail
        const result = await ZipCode.insertMany(batch, {
          ordered: false,
          // Skip duplicate key errors - useful if you're running this multiple times
          // or if there's a chance of duplicates in your data
          lean: true
        });

        processed += batch.length;
        console.log(`Processed ${processed}/${zipCodeData.length} ZIP codes`);
      } catch (err) {
        // Even with errors, MongoDB may have inserted some documents
        // Check err.insertedDocs if available to see what was inserted
        if (err.insertedDocs) {
          processed += err.insertedDocs.length;
          console.log(`Partially processed batch. Inserted ${err.insertedDocs.length} documents.`);
        }
        console.error(`Error processing batch starting at index ${i}:`, err.message);
      }

      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`ZIP code import complete! Processed ${processed} ZIP codes.`);
  } catch (error) {
    console.error('Error importing ZIP codes:', error);
  }
}

importZipCodes().catch(console.error);