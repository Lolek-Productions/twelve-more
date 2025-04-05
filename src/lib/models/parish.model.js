import mongoose from 'mongoose';

const ParishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parish name is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipcode: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a compound index on name and city to ensure uniqueness
ParishSchema.index({ name: 1, zipcode: 1 });

// Export the Parish model
const Parish = mongoose.models.Parish || mongoose.model('Parish', ParishSchema);

export default Parish;