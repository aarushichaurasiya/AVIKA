const mongoose = require('mongoose');

const kitchenSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    cuisine: [{ type: String, trim: true }],
    description: { type: String, trim: true, maxlength: 600 },
    logoUrl: String,
    coverUrl: String,

    // GeoJSON point for nearby-kitchen queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        // [lng, lat] — GeoJSON order, not [lat, lng]
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: 'coordinates must be [lng, lat]'
        }
      },
      address: { type: String, required: true }
    },

    minOrderAmount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 0, min: 0 },
    avgPrepTimeMinutes: { type: Number, default: 30, min: 5 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }, // admin gate before going live
    employees: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, trim: true, default: 'Cook' },
        phone: { type: String, trim: true },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    operatingHours: [
      {
        day: { type: Number, min: 0, max: 6 }, // 0 = Sunday
        openTime: String, // "09:00"
        closeTime: String // "21:00"
      }
    ]
  },
  { timestamps: true }
);

kitchenSchema.index({ location: '2dsphere' });
kitchenSchema.index({ name: 'text', cuisine: 'text' });

module.exports = mongoose.model('Kitchen', kitchenSchema);
