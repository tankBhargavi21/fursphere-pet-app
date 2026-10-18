import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { defaultProducts } from '../services/seedData.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to compute subtotal and grand total
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 50; // Free shipping above ₹499
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
};

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { isConnected } = getDBStatus();

    if (isConnected) {
      let cart = await Cart.findOne({ userId }).populate('items.product');
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
      const totals = calculateCartTotals(cart.items);
      return res.json({ success: true, cart: cart.items, ...totals });
    } else {
      const carts = LocalStore.get('carts') || {};
      const userCartItems = carts[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      // Populate products
      const populatedItems = userCartItems.map((item) => {
        const prod = prods.find((p) => (p._id || p.id) === item.productId);
        return {
          _id: item.id || 'item_' + item.productId,
          product: prod || { _id: item.productId, name: 'Item', price: 0, image: '' },
          quantity: item.quantity,
        };
      });

      const totals = calculateCartTotals(populatedItems);
      return res.json({ success: true, cart: populatedItems, ...totals });
    }
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
});

// POST /api/cart/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId.toString()
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += Number(quantity);
      } else {
        cart.items.push({ product: productId, quantity: Number(quantity) });
      }

      await cart.save();
      await cart.populate('items.product');
      const totals = calculateCartTotals(cart.items);
      return res.json({ success: true, message: 'Added to cart!', cart: cart.items, ...totals });
    } else {
      LocalStore.update((data) => {
        data.carts = data.carts || {};
        data.carts[userId] = data.carts[userId] || [];

        const existing = data.carts[userId].find((it) => it.productId === productId);
        if (existing) {
          existing.quantity += Number(quantity);
        } else {
          data.carts[userId].push({
            id: 'cart_' + Date.now(),
            productId,
            quantity: Number(quantity),
          });
        }
        return data;
      });

      // return populated cart
      const carts = LocalStore.get('carts') || {};
      const userCartItems = carts[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      const populatedItems = userCartItems.map((item) => {
        const prod = prods.find((p) => (p._id || p.id) === item.productId);
        return {
          _id: item.id,
          product: prod || { _id: item.productId, name: 'Item', price: 0, image: '' },
          quantity: item.quantity,
        };
      });

      const totals = calculateCartTotals(populatedItems);
      return res.json({ success: true, message: 'Added to cart!', cart: populatedItems, ...totals });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// POST /api/cart/update
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
    }

    const qty = Number(quantity);
    const { isConnected } = getDBStatus();

    if (isConnected) {
      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

      if (qty <= 0) {
        cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
      } else {
        const item = cart.items.find((item) => item.product.toString() === productId.toString());
        if (item) {
          item.quantity = qty;
        }
      }

      await cart.save();
      await cart.populate('items.product');
      const totals = calculateCartTotals(cart.items);
      return res.json({ success: true, message: 'Cart updated.', cart: cart.items, ...totals });
    } else {
      LocalStore.update((data) => {
        data.carts = data.carts || {};
        data.carts[userId] = data.carts[userId] || [];

        if (qty <= 0) {
          data.carts[userId] = data.carts[userId].filter((it) => it.productId !== productId);
        } else {
          const item = data.carts[userId].find((it) => it.productId === productId);
          if (item) item.quantity = qty;
        }
        return data;
      });

      const carts = LocalStore.get('carts') || {};
      const userCartItems = carts[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      const populatedItems = userCartItems.map((item) => {
        const prod = prods.find((p) => (p._id || p.id) === item.productId);
        return {
          _id: item.id,
          product: prod || { _id: item.productId, name: 'Item', price: 0, image: '' },
          quantity: item.quantity,
        };
      });

      const totals = calculateCartTotals(populatedItems);
      return res.json({ success: true, message: 'Cart updated.', cart: populatedItems, ...totals });
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
});

// POST /api/cart/remove
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { productId } = req.body;

    const { isConnected } = getDBStatus();

    if (isConnected) {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
        await cart.save();
        await cart.populate('items.product');
      }
      const totals = calculateCartTotals(cart ? cart.items : []);
      return res.json({ success: true, message: 'Item removed.', cart: cart ? cart.items : [], ...totals });
    } else {
      LocalStore.update((data) => {
        data.carts = data.carts || {};
        if (data.carts[userId]) {
          data.carts[userId] = data.carts[userId].filter((it) => it.productId !== productId);
        }
        return data;
      });

      const carts = LocalStore.get('carts') || {};
      const userCartItems = carts[userId] || [];
      const prods = LocalStore.get('products') || defaultProducts;

      const populatedItems = userCartItems.map((item) => {
        const prod = prods.find((p) => (p._id || p.id) === item.productId);
        return {
          _id: item.id,
          product: prod,
          quantity: item.quantity,
        };
      });

      const totals = calculateCartTotals(populatedItems);
      return res.json({ success: true, message: 'Item removed.', cart: populatedItems, ...totals });
    }
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
});

// POST /api/cart/clear
router.post('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { isConnected } = getDBStatus();

    if (isConnected) {
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } else {
      LocalStore.update((data) => {
        data.carts = data.carts || {};
        data.carts[userId] = [];
        return data;
      });
    }

    return res.json({ success: true, message: 'Cart cleared.', cart: [], subtotal: 0, shipping: 0, total: 0 });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

export default router;
