import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Cat Food',
      'Dog Food',
      'Pet Medicines',
      'Toys',
      'Accessories',
      'Grooming',
      'Healthcare',
      'Other'
    ],
  },
  petType: {
    type: String,
    enum: ['cat', 'dog', 'all'],
    default: 'all',
  },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  reviewCount: { type: Number, default: 120 },
  description: { type: String, required: true },
  weight: { type: String, default: '1 kg' },
  highlights: [{ type: String }],
  stock: { type: Number, default: 50 },
  inStock: { type: Boolean, default: true },
  image: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ petType: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
