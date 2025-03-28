import { connect } from '../src/lib/mongodb/mongoose.js';
import User from '../src/lib/models/user.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '/Users/joshmccarty/Code-2022M1/twelve-more/.env.local' });

// Running this script: node scripts/migration.js

console.log('Running migration');

const ORGANIZATION_ID = '67c3776011f461e755fab65a'; //TwelveMore/St. Leo...

//Worked
// async function runMigration() {
//   try {
//     await connect();
//     console.log('Connected to MongoDB');
//
//     // Access the raw MongoDB collection
//     const db = mongoose.connection.db;
//     const userCollection = db.collection('users'); // Adjust if your collection name differs
//
//     // Count documents with the field before
//     const beforeCount = await userCollection.countDocuments({ selectedOrganizationId: { $exists: true } });
//     console.log(`Users with selectedOrganizationId before: ${beforeCount}`);
//
//     // Force removal of the field from all documents
//     const result = await userCollection.updateMany(
//       {}, // No filter - apply to all documents
//       { $unset: { selectedOrganizationId: '' } }
//     );
//
//     console.log(`Migration completed! Attempted to remove selectedOrganizationId from ${result.modifiedCount} users`);
//
//     // Verify after
//     const afterCount = await userCollection.countDocuments({ selectedOrganizationId: { $exists: true } });
//     console.log(`Users with selectedOrganizationId after: ${afterCount}`);
//   } catch (error) {
//     console.error('Migration failed:', error);
//   } finally {
//     await mongoose.connection.close();
//     console.log('MongoDB connection closed');
//   }
// }


// async function runMigration() {
//   try {
//     await connect();
//     console.log('Connected to MongoDB');
//
//     const result = await User.updateMany(
//       { selectedOrganizationId: { $exists: true } }, // Target docs with the field
//       { $unset: { selectedOrganizationId: '' } }     // Remove the field
//     );
//
//     console.log(`Migration completed! Removed selectedOrganizationId from ${result.modifiedCount} users`);
//   } catch (error) {
//     console.error('Migration failed:', error);
//   } finally {
//     await mongoose.connection.close();
//     console.log('MongoDB connection closed');
//   }
// }


// async function runMigration() {
//   await connect();
//   console.log('Connected to MongoDB');
//
//   const result = await User.updateMany(
//     {},
//     {
//       $addToSet: {
//         organizations: {
//           organization: new mongoose.Types.ObjectId(ORGANIZATION_ID),
//           role: 'member',
//         },
//       },
//       $set: { selectedOrganization: new mongoose.Types.ObjectId(ORGANIZATION_ID) },
//     }
//   );
//
//   console.log(`Modified ${result.modifiedCount} users`);
//
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed');
// }


//Didn't work because I had already removed selectedOrganizationId from the model
// async function runMigration() {
//   try {
//     await connect();
//     console.log('Connected to MongoDB');
//
//     const result = await User.updateMany(
//       { selectedOrganizationId: { $exists: true } }, // Only update docs with the old field
//       { $rename: { selectedOrganizationId: 'selectedOrganization' } }
//     );
//
//     console.log(`Migration completed! Modified ${result.modifiedCount} users`);
//   } catch (error) {
//     console.error('Migration failed:', error);
//   } finally {
//     await mongoose.connection.close();
//     console.log('MongoDB connection closed');
//   }
// }

runMigration().catch(console.error);