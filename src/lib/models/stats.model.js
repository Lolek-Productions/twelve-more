import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Using string format 'YYYY-MM-DD'
      required: true,
      unique: true,
      index: true
    },
    newUsers: {
      type: Number,
    },
    newCommunities: {
      type: Number,
    },
    newOrganizations: {
      type: Number,
    },
    activeUsers: {
      type: Number,
    },
    newPosts: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Stats = mongoose.models?.Stats || mongoose.model('Stats', statsSchema);

export default Stats;
