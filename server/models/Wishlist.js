import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
