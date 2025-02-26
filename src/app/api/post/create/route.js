import Post from '@/lib/models/post.model.js';
import { connect } from '@/lib/mongodb/mongoose.js';
import { currentUser } from '@clerk/nextjs/server';
import twilioService from '@/lib/services/twilioService.js'; // Import your Twilio service

export const POST = async (req) => {
  const user = await currentUser();
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production'; // Check environment

  try {
    await connect();
    const data = await req.json();

    if (!user?.publicMetadata?.userMongoId) {
      console.error('⚠️ Warning: Missing userMongoId in publicMetadata');
    }

    if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    const newPost = await Post.create({
      user: data.userMongoId,
      text: data.text,
      profileImg: data.profileImg,
      image: data.image,
      audio: data.audio,
      community: data.communityId,
    });

    await newPost.save();

    // Find the other members in the community
    if (data.communityId && isProduction) {
      const community = await Community.findById(data.communityId)
        .populate('members', 'phoneNumber') // Populate members with phoneNumber
        .lean();

      if (!community || !community.members?.length) {
        console.log('No members found in community:', data.communityId);
      } else {
        // Filter out the current user (don't notify the poster)
        const otherMembers = community.members.filter(
          (member) => member._id.toString() !== data.userMongoId
        );


        const communityLink = `${process.env.APP_URL}/communities/${data.communityId}`;
        const messageBody = `A new post was added to your community! Check it out: ${communityLink}`;

        for (const member of otherMembers) {
          if (member.phoneNumber) {
            const smsResult = await twilioService.sendSMS(member.phoneNumber, messageBody);
            console.log(`SMS to ${member.phoneNumber}:`, smsResult.message);
          } else {
            console.log(`No phone number for member: ${member._id}`);
          }
        }
      }
    } else {
      console.log('No communityId provided, skipping notification');
    }

    return new Response(JSON.stringify(newPost), {
      status: 200,
    });
  } catch (error) {
    console.log('Error creating post:', error);
    return new Response('Error creating post', {
      status: 500,
    });
  }
};
