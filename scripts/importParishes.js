'use server'

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Parish from '../src/lib/models/parish.model.js';

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script:
// node scripts/importParishes.js


// Batch size for insertMany operations
const BATCH_SIZE = 500;

// Function to read JSON files from a directory
async function readJsonFilesFromDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    const allParishes = [];

    for (const file of jsonFiles) {
      const filePath = path.join(directoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      try {
        const parsedData = JSON.parse(fileContent);

        // Check if the file has a "parishes" array
        if (parsedData.parishes && Array.isArray(parsedData.parishes)) {
          allParishes.push(...parsedData.parishes);
        }
      } catch (parseError) {
        console.error(`Error parsing JSON file ${file}:`, parseError);
      }
    }

    return allParishes;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// Function to import parishes into MongoDB in batches without checking for duplicates
async function importParishes() {
  const directoryPath = "../../Desktop/json_results";
  // return console.log(directoryPath);

  try {
    const parishes = await readJsonFilesFromDirectory(directoryPath);

    if (parishes.length === 0) {
      console.log('No parishes found in the directory.');
      return;
    }
    console.log(`Found ${parishes.length} parishes to import.`);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'twelve-more-app',
    });
    console.log('Connected to MongoDB');


    // Process in batches without checking for duplicates
    let totalProcessed = 0;
    let totalImported = 0;

    for (let i = 0; i < parishes.length; i += BATCH_SIZE) {
      const batch = parishes.slice(i, i + BATCH_SIZE);
      totalProcessed += batch.length;

      if (batch.length > 0) {
        try {
          // Use insertMany for the batch - will attempt to insert everything
          const result = await Parish.insertMany(batch, { ordered: false });
          totalImported += result.length;

          console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Successfully processed ${result.length} parishes`);
        } catch (error) {
          // When using ordered:false, MongoDB continues processing after errors
          // We can check if any documents were actually inserted
          if (error.insertedDocs && error.insertedDocs.length) {
            totalImported += error.insertedDocs.length;
            console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Partially imported ${error.insertedDocs.length} parishes`);
            console.log(`Some parishes were skipped due to: ${error.message}`);
          } else {
            console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed completely: ${error.message}`);
          }
        }
      }

      // Progress update
      console.log(`Progress: ${totalProcessed}/${parishes.length} processed (${Math.round(totalProcessed/parishes.length*100)}%)`);
    }

    console.log(`
      Import summary:
      - Total parishes found: ${parishes.length}
      - Total parishes processed: ${totalProcessed}
      - Total parishes imported: ${totalImported}
      - Parishes not imported: ${totalProcessed - totalImported} (likely duplicates)
    `);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error during import:', error);
    await mongoose.disconnect();
  }
}

// Run the import
importParishes()
  .then(() => console.log('Migration process completed.'))
  .catch(err => {
    console.error('Migration failed:', err);
    mongoose.disconnect().then(() => process.exit(1));
  });