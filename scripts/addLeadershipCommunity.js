'use server'

import { connect } from '../src/lib/mongodb/mongoose.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Organization from "../src/lib/models/organization.model.js";
import Community from "../src/lib/models/community.model.js";
import User from "../src/lib/models/user.model.js";

import {addCommunityToUser} from "../src/lib/actions/user.js";

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script:
// node scripts/addLeadershipCommunity.js

export async function runMigration() {
  try {
    // Connect to MongoDB (update with your connection string)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all organizations
    const organizations = await Organization.find({});
    console.log(`Found ${organizations.length} organizations to process`);

    for (const organization of organizations) {
      console.log(`Processing organization: ${organization.name} (${organization._id})`);

      // Skip if organization already has a leadership community
      if (organization.leadershipCommunity) {
        console.log(`Organization ${organization.name} already has a leadership community`);
        continue;
      }

      // Find the creator of the organization to use as creator of the leadership community
      const orgCreator = organization.createdBy;

      // Create leadership community for the organization
      const leadershipCommunity = await Community.create({
        name: `${organization.name} Leadership Community`,
        purpose: `To help develop the leadership of communities at ${organization.name}`,
        visibility: "private",
        createdBy: orgCreator,
        organization: organization._id,
      });

      console.log(`Created leadership community: ${leadershipCommunity.name} (${leadershipCommunity._id})`);

      // Update organization with the new leadership community
      await Organization.findByIdAndUpdate(
        organization._id,
        { leadershipCommunity: leadershipCommunity._id }
      );

      // Add the organization creator as a leader of the leadership community
      const leadershipResult = await addCommunityToUser(leadershipCommunity._id.toString(), orgCreator, 'leader', true);
      if (!leadershipResult.success) {
        console.warn(`Failed to add organization creator to leadership community: ${leadershipResult.error}`);
      }

      // Find all communities in this organization
      const communities = await Community.find({ organization: organization._id });
      console.log(`Found ${communities.length} communities in organization ${organization.name}`);

      // Find all users who are leaders in any community of this organization
      const users = await User.find({
        'communities.role': 'leader',
        'organizations.organization': organization._id
      });

      // Set to track unique users who've been added (to prevent duplicates)
      const addedLeaders = new Set();

      // Process each user
      for (const user of users) {
        // Skip if we've already processed this user
        if (addedLeaders.has(user._id.toString())) continue;

        // Check if the user is a leader in any community of this organization
        const isLeaderInOrg = user.communities.some(membership => {
          // Find if this community belongs to the current organization
          const communityInOrg = communities.some(comm =>
            comm._id.toString() === membership.community.toString()
          );
          return communityInOrg && membership.role === 'leader';
        });

        if (isLeaderInOrg) {
          // Add user to leadership community as a member
          const addResult = await addCommunityToUser(leadershipCommunity._id.toString(), user._id, 'member', true);
          if (addResult.success) {
            console.log(`Added leader ${user.firstName} ${user.lastName} (${user._id}) to leadership community`);
            addedLeaders.add(user._id.toString());
          } else {
            console.warn(`Failed to add leader to leadership community: ${addResult.error}`);
          }
        }
      }

      console.log(`Finished processing organization ${organization.name}. Added ${addedLeaders.size} leaders to leadership community.`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

runMigration().catch(console.error);