'use server'

import { connect } from '../src/lib/mongodb/mongoose.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from "../src/lib/models/community.model.js";
import Organization from "../src/lib/models/organization.model.js";
import Post from '../src/lib/models/post.model.js';

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });


// Running this script:
// node scripts/migrationExample.js


export async function runMigration() {
  try {
    // Connect to MongoDB (update with your connection string)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const leadershipCommunity = await Community.create({
      name: `Leadership Community`,
      purpose: `To help develop the leadership of small groups at`,
      visibility: "private",
      createdBy: null,
      organization: null,
    });

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

runMigration().catch(console.error);