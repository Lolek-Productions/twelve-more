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
            required: true, // e.g., "member", "admin", "moderator"
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
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model('User', userSchema);

export default User;
