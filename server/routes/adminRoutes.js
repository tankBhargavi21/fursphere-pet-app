import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { defaultProducts } from '../services/seedData.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Strict Administrator Authorization Middleware
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only FurSphere administrators can perform this action.',
    });
  }
  next();
};

// Protect all /api/admin endpoints with auth and admin role check
router.use(authMiddleware, adminAuth);

// Helper to calculate timeline based on new status
const updateTimelineStatus = (timeline, newStatus) => {
  const statusLevels = {
    'Confirmed': 1,
    'Processing': 2,
    'Shipped': 3,
    'Delivered': 4,
    'Cancelled': 0
  };

  const currentLevel = statusLevels[newStatus] || 1;
  const now = new Date();

  const standardSteps = [
    { status: 'Confirmed', description: 'Order verified and confirmed by FurSphere.' },
    { status: 'Processing', description: 'Packed with love at our pet-care warehouse.' },
    { status: 'Shipped', description: 'Out with delivery partner for fast dispatch.' },
    { status: 'Delivered', description: 'Delivered safely to your pet door.' }
  ];

  if (newStatus === 'Cancelled') {
    return [
      { status: 'Cancelled', time: now, description: 'Order cancelled by Admin/Customer.', done: true }
    ];
  }

  return standardSteps.map((step, idx) => {
    const isDone = idx + 1 <= currentLevel;
    return {
      status: step.status,
      description: step.description,
      done: isDone,
      time: isDone ? now : new Date(now.getTime() + (idx * 12 * 60 * 60 * 1000))
    };
  });
};

// GET /api/admin/stats - High-level metrics
router.get('/stats', async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const totalOrders = await Order.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalUsers = await User.countDocuments();

      // Calculate total revenue from delivered / confirmed orders
      const revenueAgg = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email phone');

      return res.json({
        success: true,
        stats: {
          totalOrders,
          totalRevenue,
          totalProducts,
          totalUsers,
          recentOrders
        }
      });
    } else {
      const orders = LocalStore.get('orders') || [];
      const products = LocalStore.get('products') || defaultProducts;
      const users = LocalStore.get('users') || [];

      const totalRevenue = orders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      return res.json({
        success: true,
        stats: {
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalUsers: users.length,
          recentOrders: orders.slice(0, 5)
        }
      });
    }
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin statistics.' });
  }
});

// GET /api/admin/orders - Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { isConnected } = getDBStatus();
    const { status, search } = req.query;

    if (isConnected) {
      let query = {};
      if (status && status !== 'All') {
        query.orderStatus = status;
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'deliveryAddress.city': { $regex: search, $options: 'i' } },
          { 'deliveryAddress.street': { $regex: search, $options: 'i' } }
        ];
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email phone');

      return res.json({ success: true, count: orders.length, orders });
    } else {
      let orders = [...(LocalStore.get('orders') || [])];
      if (status && status !== 'All') {
        orders = orders.filter((o) => o.orderStatus === status);
      }
      if (search) {
        const s = search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.orderNumber?.toLowerCase().includes(s) ||
            o.deliveryAddress?.city?.toLowerCase().includes(s) ||
            o.deliveryAddress?.street?.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, count: orders.length, orders });
    }
  } catch (error) {
    console.error('[Admin Orders Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// PUT /api/admin/orders/:id/status - Update order status and tracking timeline
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    const { isConnected } = getDBStatus();
    const updatedTimeline = updateTimelineStatus([], status);

    if (isConnected) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      order.orderStatus = status;
      order.timeline = updatedTimeline;
      if (status === 'Delivered') {
        order.paymentStatus = 'Paid';
      }
      await order.save();

      return res.json({
        success: true,
        message: `Order #${order.orderNumber} status updated to ${status}!`,
        order
      });
    } else {
      let orders = LocalStore.get('orders') || [];
      const index = orders.findIndex((o) => o._id === id || o.orderNumber === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      orders[index].orderStatus = status;
      orders[index].timeline = updatedTimeline;
      if (status === 'Delivered') {
        orders[index].paymentStatus = 'Paid';
      }
      LocalStore.set('orders', orders);

      return res.json({
        success: true,
        message: `Order status updated to ${status}!`,
        order: orders[index]
      });
    }
  } catch (error) {
    console.error('[Admin Update Order Status Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// POST /api/admin/products - Create new product
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, petType, image, stock, isFeatured, isPopular } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Product name, price, and category are required.' });
    }

    const { isConnected } = getDBStatus();

    const productData = {
      name: name.trim(),
      description: description || 'Wholesome premium pet essential from FurSphere.',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
      category: category.trim(),
      petType: petType || 'all',
      image: image || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
      stock: stock !== undefined ? Number(stock) : 50,
      rating: 4.8,
      reviewsCount: 12,
      isFeatured: Boolean(isFeatured),
      isPopular: Boolean(isPopular)
    };

    if (isConnected) {
      const newProduct = await Product.create(productData);
      return res.status(201).json({ success: true, message: 'Product created successfully!', product: newProduct });
    } else {
      const products = LocalStore.get('products') || defaultProducts;
      const newProduct = {
        _id: 'prod_' + Date.now(),
        ...productData
      };
      products.unshift(newProduct);
      LocalStore.set('products', products);
      return res.status(201).json({ success: true, message: 'Product created successfully!', product: newProduct });
    }
  } catch (error) {
    console.error('[Admin Create Product Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// PUT /api/admin/products/:id - Edit product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json({ success: true, message: 'Product updated successfully!', product: updatedProduct });
    } else {
      let products = LocalStore.get('products') || defaultProducts;
      const index = products.findIndex((p) => p._id === id || p.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      products[index] = { ...products[index], ...req.body };
      LocalStore.set('products', products);
      return res.json({ success: true, message: 'Product updated successfully!', product: products[index] });
    }
  } catch (error) {
    console.error('[Admin Update Product Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json({ success: true, message: 'Product deleted successfully!' });
    } else {
      let products = LocalStore.get('products') || defaultProducts;
      products = products.filter((p) => p._id !== id && p.id !== id);
      LocalStore.set('products', products);
      return res.json({ success: true, message: 'Product deleted successfully!' });
    }
  } catch (error) {
    console.error('[Admin Delete Product Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// GET /api/admin/users - User directory
router.get('/users', async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, users });
    } else {
      const users = (LocalStore.get('users') || []).map(({ password, ...u }) => u);
      return res.json({ success: true, count: users.length, users });
    }
  } catch (error) {
    console.error('[Admin Users Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

export default router;
