import User from '@/lib/models/user.model';
import { connect } from '@/lib/mongodb/mongoose';

export const POST = async (req) => {
  try {
    // Ensure MongoDB connection is established
    await connect();

    // Parse the request body
    const data = await req.json();
    // console.log('Request data:', data); // { userId: '67b63722b63603a6b567eb31' }

    // Validate userId presence
    const { userId } = data;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400 }
      );
    }

    // Fetch user by _id (assuming userId is the MongoDB _id)
    const user = await User.findOne({ _id: userId });

    // Check if user was found
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    // Return the user data
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch the user data', details: err.message }),
      { status: 500 }
    );
  }
};