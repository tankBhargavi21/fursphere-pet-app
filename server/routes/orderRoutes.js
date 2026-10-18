import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';
import { defaultProducts } from '../services/seedData.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate unique order ID like #FS123456
const generateOrderNumber = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `#FS${randomNum}`;
};

// GET /api/orders - Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    } else {
      const allOrders = LocalStore.get('orders') || [];
      const userOrders = allOrders.filter((o) => o.userId === userId);
      return res.json({ success: true, count: userOrders.length, orders: userOrders });
    }
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// GET /api/orders/:id - Get specific order and tracking status
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    let order = null;
    if (isConnected) {
      order = await Order.findOne({
        $and: [{ userId }, { $or: [{ _id: id }, { orderNumber: id }] }],
      });
    } else {
      const allOrders = LocalStore.get('orders') || [];
      order = allOrders.find(
        (o) => o.userId === userId && (o._id === id || o.orderNumber === id)
      );
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
});

// POST /api/orders/checkout - Place order
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items cannot be empty.' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
      return res.status(400).json({ success: false, message: 'Valid delivery address is required.' });
    }

    const validPaymentMethods = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Please select a valid payment method.' });
    }

    const { isConnected } = getDBStatus();
    let validatedItems = [];
    let calculatedSubtotal = 0;

    if (isConnected) {
      for (const item of items) {
        const prodId = item.productId || (item.product && (item.product._id || item.product.id));
        const product = await Product.findById(prodId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product not found: ${prodId}` });
        }
        const qty = Math.max(1, parseInt(item.quantity) || 1);
        const itemTotal = product.price * qty;
        calculatedSubtotal += itemTotal;

        validatedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
        });
      }
    } else {
      const prods = LocalStore.get('products') || defaultProducts;
      for (const item of items) {
        const prodId = item.productId || (item.product && (item.product._id || item.product.id));
        const product = prods.find((p) => (p._id || p.id) === prodId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product not found: ${prodId}` });
        }
        const qty = Math.max(1, parseInt(item.quantity) || 1);
        const itemTotal = product.price * qty;
        calculatedSubtotal += itemTotal;

        validatedItems.push({
          product: product._id || product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
        });
      }
    }

    const calculatedShipping = calculatedSubtotal > 499 ? 0 : 50;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;
    const orderNumber = generateOrderNumber();

    const now = new Date();
    const timeline = [
      { status: 'Confirmed', time: now, description: 'Order verified and confirmed by FurSphere.', done: true },
      { status: 'Processing', time: new Date(now.getTime() + 2 * 60 * 60 * 1000), description: 'Packed with love at our pet-care warehouse.', done: true },
      { status: 'Shipped', time: new Date(now.getTime() + 12 * 60 * 60 * 1000), description: 'Out with delivery partner for fast dispatch.', done: false },
      { status: 'Delivered', time: new Date(now.getTime() + 48 * 60 * 60 * 1000), description: 'Delivered safely to your pet door.', done: false },
    ];

    let savedOrder;

    if (isConnected) {
      savedOrder = await Order.create({
        userId,
        orderNumber,
        items: validatedItems,
        deliveryAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Confirmed',
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        total: calculatedTotal,
        timeline,
      });

      // Clear the user's cart after successful checkout
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } else {
      savedOrder = {
        _id: 'order_' + Date.now(),
        userId,
        orderNumber,
        items: validatedItems,
        deliveryAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Confirmed',
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        total: calculatedTotal,
        timeline,
        createdAt: now.toISOString(),
      };

      LocalStore.update((data) => {
        data.orders = data.orders || [];
        data.orders.unshift(savedOrder);
        data.carts = data.carts || {};
        data.carts[userId] = [];
        return data;
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

export default router;
