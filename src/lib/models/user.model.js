import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    bio: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
    },
    avatar: {
      type: String,
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    communities: {
      type: [
        {
          community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
            required: true,
          },
          role: {
            type: String,
            required: true, // e.g., "member", "leader"
            default: 'member',
          },
        },
      ],
      default: [],
    },
    organizations: {
      type: [
        {
          organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
          },
          role: {
            type: String,
            required: true,
            default: 'member',
          },
        },
      ],
      default: [],
    },
    selectedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    courseProgress: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        },
        completedModules: {
          type: [Number], // array of module indices completed
          default: []
        },
        lastAccessed: {
          type: Date,
          default: Date.now
        }
      }
    ],
    settings: {
      type: {
        notifyOnNewPostInCommunity: { type: Boolean, default: true },
        notifyOnPostLiked: { type: Boolean, default: true },
        notifyOnPostPrayedFor: { type: Boolean, default: true },
        notifyOnNewMemberInCommunity: { type: Boolean, default: false },
        notifyOnCommentOnMyPost: { type: Boolean, default: true },
        notifyOnCommentOnCommentedPost: { type: Boolean, default: false },
        preferredCommunication: {
          type: String,
          enum: ['email', 'sms', 'push'],
          default: 'sms'
        }
      },
      default: () => ({
        notifyOnNewPostInCommunity: true,
        notifyOnPostLiked: true,
        notifyOnPostPrayedFor: true,
        notifyOnNewMemberInCommunity: false,
        notifyOnCommentOnMyPost: true,
        notifyOnCommentOnCommentedPost: false,
        preferredCommunication: 'sms'
      })
    },
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model('User', userSchema);

export default User;
