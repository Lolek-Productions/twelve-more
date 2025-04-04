import mongoose from 'mongoose';

const zipCodeSchema = new mongoose.Schema(
  {
    zip_code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    usps_city: {
      type: String,
      trim: true,
    },
    stusps_code: {
      type: String,
      trim: true,
      index: true,
    },
    ste_name: {
      type: String,
      trim: true,
    },
    population: {
      type: Number,
    },
    density: {
      type: Number,
    },
    primary_coty_name: {
      type: String,
    },
    timezone: {
      type: String,
    },
    geo_point_2d: {
      lon: { type: Number },
      lat: { type: Number },
    }
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index for the geo_point_2d field
zipCodeSchema.index({ 'geo_point_2d': '2dsphere' });

const ZipCode = mongoose.models.ZipCode || mongoose.model('ZipCode', zipCodeSchema);

export default ZipCode;