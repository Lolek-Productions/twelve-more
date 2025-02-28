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
  },
  { timestamps: true }
);

const Organization = mongoose.models?.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;
