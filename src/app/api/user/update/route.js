import User from '@/lib/models/user.model.js';
import { connect } from '@/lib/mongodb/mongoose.js';
import { currentUser } from '@clerk/nextjs/server';

export const POST = async (req) => {
  try {
    await connect();
    const user = await currentUser();
    const data = await req.json();

    // ✅ Ensure user is authenticated
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // ✅ Ensure userMongoId exists in Clerk metadata
    if (!user.publicMetadata?.userMongoId) {
      console.error('Warning: Missing userMongoId in publicMetadata');
      return new Response('UserMongoId is missing from public metadata', { status: 400 });
    }

    // ✅ Ensure the correct user is making the update
    if (user.publicMetadata.userMongoId !== data.userMongoId) {
      console.error('Warning: Missing userMongoId mismatch', user.publicMetadata.userMongoId, data.userMongoId);
      return new Response('Unauthorized', { status: 403 });
    }

    // ✅ Find and update the user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { _id: data.userMongoId }, // Match user by MongoDB ID
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          bio: data.bio,
        },
      },
      { new: true } // Return updated user
    );

    if (!updatedUser) {
      return new Response('User not found', { status: 404 });
    }

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response('Error updating user', { status: 500 });
  }
};