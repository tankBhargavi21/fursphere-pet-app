import express from 'express';
import Product from '../models/Product.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { defaultProducts } from '../services/seedData.js';

const router = express.Router();

// Helper to ensure products exist
export const ensureProductsSeeded = async () => {
  const { isConnected } = getDBStatus();
  if (isConnected) {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[FurSphere Products] Seeding initial product catalog into MongoDB...');
      await Product.insertMany(defaultProducts.map(({ _id, ...p }) => p));
    }
  } else {
    const prods = LocalStore.get('products') || [];
    if (prods.length === 0) {
      console.log('[FurSphere Products] Initializing local product catalog...');
      LocalStore.set('products', defaultProducts);
    }
  }
};

// GET /api/products
router.get('/', async (req, res) => {
  try {
    await ensureProductsSeeded();
    const { category, search, sort, petType, featured, popular } = req.query;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      let query = {};
      if (category && category !== 'All' && category !== 'Other') {
        query.category = category;
      }
      if (petType && petType !== 'all') {
        query.petType = { $in: [petType, 'all'] };
      }
      if (featured === 'true') {
        query.isFeatured = true;
      }
      if (popular === 'true') {
        query.isPopular = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOption = {};
      if (sort === 'price_low') sortOption.price = 1;
      else if (sort === 'price_high') sortOption.price = -1;
      else if (sort === 'rating') sortOption.rating = -1;
      else sortOption.createdAt = -1;

      const products = await Product.find(query).sort(sortOption);
      return res.json({ success: true, count: products.length, products });
    } else {
      let products = [...(LocalStore.get('products') || defaultProducts)];

      if (category && category !== 'All') {
        products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (petType && petType !== 'all') {
        products = products.filter((p) => p.petType === petType || p.petType === 'all');
      }
      if (featured === 'true') {
        products = products.filter((p) => p.isFeatured);
      }
      if (popular === 'true') {
        products = products.filter((p) => p.isPopular);
      }
      if (search) {
        const s = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.category.toLowerCase().includes(s)
        );
      }

      if (sort === 'price_low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }

      return res.json({ success: true, count: products.length, products });
    }
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'cat_food', name: 'Cat Food', icon: 'Fish', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'dog_food', name: 'Dog Food', icon: 'Bone', color: 'bg-amber-50 text-amber-600' },
    { id: 'medicines', name: 'Pet Medicines', icon: 'Pill', color: 'bg-pink-50 text-pink-600' },
    { id: 'toys', name: 'Toys', icon: 'Gamepad2', color: 'bg-purple-50 text-purple-600' },
    { id: 'accessories', name: 'Accessories', icon: 'Tag', color: 'bg-sky-50 text-sky-600' },
    { id: 'grooming', name: 'Grooming', icon: 'Sparkles', color: 'bg-rose-50 text-rose-600' },
    { id: 'healthcare', name: 'Healthcare', icon: 'HeartPulse', color: 'bg-red-50 text-red-600' },
    { id: 'other', name: 'Other', icon: 'Package', color: 'bg-teal-50 text-teal-600' },
  ];
  res.json({ success: true, categories });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, product });
    } else {
      const prods = LocalStore.get('products') || defaultProducts;
      const product = prods.find((p) => p._id === id || p.id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, product });
    }
  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
});

export default router;
