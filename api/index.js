import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/config/db.js';
import authRoutes from '../server/routes/authRoutes.js';
import productRoutes, { ensureProductsSeeded } from '../server/routes/productRoutes.js';
import { ensureAdminUser } from '../server/services/seedData.js';
import cartRoutes from '../server/routes/cartRoutes.js';
import wishlistRoutes from '../server/routes/wishlistRoutes.js';
import petRoutes from '../server/routes/petRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import aiRoutes from '../server/routes/aiRoutes.js';
import adminRoutes from '../server/routes/adminRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy DB initialization on serverless invoke
let isDbReady = false;
const initDb = async () => {
  if (!isDbReady) {
    try {
      await connectDB();
      await ensureProductsSeeded();
      await ensureAdminUser();
      isDbReady = true;
    } catch (e) {
      console.error('[Vercel Serverless DB Init Error]', e);
    }
  }
};

app.use(async (req, res, next) => {
  await initDb();
  next();
});

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    app: 'FurSphere Cloud API on Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

// Helper to mount on both /api/... and /...
const mount = (route, handler) => {
  app.use(`/api${route}`, handler);
  app.use(route, handler);
};

// Mount Routes
mount('/auth', authRoutes);
mount('/products', productRoutes);
mount('/cart', cartRoutes);
mount('/wishlist', wishlistRoutes);
mount('/pets', petRoutes);
mount('/orders', orderRoutes);
mount('/ai', aiRoutes);
mount('/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Vercel Serverless Error]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;
