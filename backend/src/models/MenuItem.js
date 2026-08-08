const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    kitchen: { type: mongoose.Schema.Types.ObjectId, ref: 'Kitchen', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300 },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: String,
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    isSpecial: { type: Boolean, default: false }, // shown as "Today's special" to customers
    dietaryTags: [{ type: String, trim: true }], // e.g. vegan, gluten-free
    spiceLevel: { type: Number, min: 0, max: 3, default: 1 }
  },
  { timestamps: true }
);

menuItemSchema.index({ kitchen: 1, category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
