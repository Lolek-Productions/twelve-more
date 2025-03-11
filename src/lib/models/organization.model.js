import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    welcomingCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Organization = mongoose.models?.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;
