import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { LocalStore } from '../services/storage.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fursphere_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or token expired.' });
      }
      req.user = user;
    } else {
      const users = LocalStore.get('users') || [];
      const user = users.find((u) => u._id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or token expired.' });
      }
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
