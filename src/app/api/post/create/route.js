import Post from '@/lib/models/post.model.js';
import User from '@/lib/models/user.model.js';
import Community from '@/lib/models/community.model.js';
import { connect } from '@/lib/mongodb/mongoose.js';
import { currentUser } from '@clerk/nextjs/server';
import twilioService from '@/lib/services/twilioService.js'; // Import your Twilio service

export const POST = async (req) => {
  const user = await currentUser();

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
      organization: data.organizationId,
    });

    await newPost.save();

    if (data.communityId) {
      try {
        // Verify the community exists
        const community = await Community.findById(data.communityId).lean();
        if (!community) {
          console.log('Community not found:', data.communityId);
          return;
        }

        // Find users who are members of this community
        const members = await User.find(
          { 'communities.community': data.communityId },
          { phoneNumber: 1, _id: 1 } // Only fetch necessary fields
        ).lean();

        if (!members?.length) {
          console.log('No members found in community:', data.communityId);
          return;
        }

        // Filter out the current user (poster) and ensure valid phone numbers
        const otherMembersPhoneNumbers = members
          .filter((member) => member._id.toString() !== data.userMongoId)
          .filter((member) => member.phoneNumber && typeof member.phoneNumber === 'string' && member.phoneNumber.trim() !== '')
          .map((member) => member.phoneNumber);

        if (!otherMembersPhoneNumbers.length) {
          console.log('No other members with valid phone numbers to notify in community:', data.communityId);
          return new Response(JSON.stringify(newPost), { status: 200 });
        }

        // Truncate the post text if it exists
        const maxTextLength = 50; // Adjust this number based on desired preview length
        const truncatedText = data.text
          ? data.text.length > maxTextLength
            ? `${data.text.substring(0, maxTextLength)}...`
            : data.text
          : '';

        const communityLink = `${process.env.APP_URL}/communities/${data.communityId}`;
        const messageBody = `New post: ${community.name}: "${truncatedText}" Check it out: ${communityLink}`;

        // Send batch SMS using Twilio Notify
        const batchResult = await twilioService.sendBatchSMS(otherMembersPhoneNumbers, messageBody);

        console.log('Community Notification Result:', {
          success: batchResult.success,
          message: batchResult.message,
          sid: batchResult.sid,
        });

        if (!batchResult.success) {
          console.error('Notification failed but post created:', batchResult.message);
        }
      } catch (error) {
        console.error('Error in community notification:', error);
      }
    } else {
      console.log('No communityId provided or not in production, skipping notification');
      console.log('communityId', data.communityId);
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
