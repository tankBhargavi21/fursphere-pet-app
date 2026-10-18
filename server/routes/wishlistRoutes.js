import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { defaultProducts } from '../services/seedData.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { isConnected } = getDBStatus();

    if (isConnected) {
      let wishlist = await Wishlist.findOne({ userId }).populate('products');
      if (!wishlist) {
        wishlist = await Wishlist.create({ userId, products: [] });
      }
      return res.json({ success: true, wishlist: wishlist.products });
    } else {
      const wishlists = LocalStore.get('wishlists') || {};
      const productIds = wishlists[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      const items = productIds
        .map((pid) => prods.find((p) => (p._id || p.id) === pid))
        .filter(Boolean);

      return res.json({ success: true, wishlist: items });
    }
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, products: [] });
      }

      const strIds = wishlist.products.map((p) => p.toString());
      const index = strIds.indexOf(productId.toString());
      let added = false;

      if (index > -1) {
        wishlist.products.splice(index, 1);
        added = false;
      } else {
        wishlist.products.push(productId);
        added = true;
      }

      await wishlist.save();
      await wishlist.populate('products');
      return res.json({
        success: true,
        message: added ? 'Added to Wishlist!' : 'Removed from Wishlist.',
        added,
        wishlist: wishlist.products,
      });
    } else {
      let added = false;
      LocalStore.update((data) => {
        data.wishlists = data.wishlists || {};
        data.wishlists[userId] = data.wishlists[userId] || [];

        const idx = data.wishlists[userId].indexOf(productId);
        if (idx > -1) {
          data.wishlists[userId].splice(idx, 1);
          added = false;
        } else {
          data.wishlists[userId].push(productId);
          added = true;
        }
        return data;
      });

      const wishlists = LocalStore.get('wishlists') || {};
      const productIds = wishlists[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      const items = productIds
        .map((pid) => prods.find((p) => (p._id || p.id) === pid))
        .filter(Boolean);

      return res.json({
        success: true,
        message: added ? 'Added to Wishlist!' : 'Removed from Wishlist.',
        added,
        wishlist: items,
      });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
});

export default router;
