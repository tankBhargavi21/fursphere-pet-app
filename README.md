# FurSphere 🐾
> **Tagline:** Happy Pets, Healthy Lives  
> **Project Type:** Full-stack Pet E-commerce and AI-powered Pet-Care Web Application.

---

## 🌟 Overview & Highlights

**FurSphere** is a modern, responsive full-stack pet-care application designed for cats and dogs, crafted to match the custom UI specification and design reference.

- **Design Style:** Mint green (`#0d5c46`, `#10b981`), sky blue, soft yellow, peach, and crisp white cards with rounded corners (16–24px) and soft shadows.
- **Responsive Architecture:** Desktop navigation bar with search and profile dropdown + native-feel mobile bottom navigation bar (`Home`, `Shop`, `AI Chat`, `Scanner`, `Profile`).
- **Complete Authentication:**
  - Phone Number Login with real 6-digit OTP verification & countdown timer.
  - Direct Password Login (Phone or Email).
  - Secure Registration & OTP-based Password Reset.
  - JWT token management & protected routes.
- **Product Catalog & E-Commerce:**
  - Product categories: Cat Food, Dog Food, Pet Medicines, Toys, Accessories, Grooming, Healthcare, Other.
  - INR (`₹`) pricing, ratings, review counts, care highlights, and weight variants.
  - Interactive Cart with server-side price & total recalculation.
  - Multi-method Checkout: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Net Banking, and Cash on Delivery.
  - Order confirmation with celebratory confetti burst, order tracking numbers (e.g. `#FS123456`), and step-by-step progress tracking (`Confirmed` → `Packed` → `Shipped` → `Delivered`).
- **Pet Management (My Pets):**
  - Add, View, Edit, and Delete pets (Cat/Dog, breed, age, gender, photo, and dietary care notes).
- **Gemini AI Pet Chat:**
  - ChatGPT-style interface with suggested pet-care question chips.
  - Powered by the Google Gemini API with medically responsible veterinary guidance disclaimers.
- **AI Pet Photo Health Scanner:**
  - Upload or select pet photos for automated AI vision analysis of breed, coat condition, demeanor, and wellness suggestions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7, Canvas Confetti |
| **Backend** | Node.js, Express.js, REST API, Multer (file uploads), CORS, Dotenv |
| **Database** | MongoDB & Mongoose (with automated resilient local fallback store) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js, Phone OTP verification |
| **AI Integration** | Google Gemini API (`@google/generative-ai` with `gemini-1.5-flash` for chat and vision) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB (or MongoDB Atlas connection string)

### 2. Environment Setup
Copy the example environment file to `server/.env`:
```bash
# In the server directory:
cp .env.example .env
```
Inside `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fursphere
JWT_SECRET=fursphere_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here # Optional
```

### 3. Start Backend Server
```bash
cd server
node server.js
```
The server will boot at `http://localhost:5000` and automatically seed the product catalog into MongoDB.

### 4. Start Frontend Client
In a separate terminal:
```bash
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser!

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/send-otp` - Generate and send 6-digit phone verification OTP
- `POST /api/auth/verify-otp` - Verify phone OTP and log in / auto-sign up
- `POST /api/auth/login` - Direct password login (email or phone)
- `POST /api/auth/register` - Create account with name, email/phone, and password
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET  /api/auth/me` - Get authenticated user profile *(Protected)*
- `PUT  /api/auth/profile` - Update name, email, phone *(Protected)*
- `POST /api/auth/address` - Add or update saved delivery addresses *(Protected)*

### Products (`/api/products`)
- `GET /api/products` - List all products with category, search, petType, and price sorting
- `GET /api/products/categories` - List categories with icons
- `GET /api/products/:id` - Get individual product details and care highlights

### Shopping Cart (`/api/cart`) *(Protected)*
- `GET  /api/cart` - Retrieve user cart with server-calculated subtotals and totals
- `POST /api/cart/add` - Add item to cart or increment quantity
- `POST /api/cart/update` - Update item quantity
- `POST /api/cart/remove` - Remove specific item
- `POST /api/cart/clear` - Empty cart

### Wishlist (`/api/wishlist`) *(Protected)*
- `GET  /api/wishlist` - Retrieve favorited products
- `POST /api/wishlist/toggle` - Add or remove product from wishlist

### My Pets (`/api/pets`) *(Protected)*
- `GET    /api/pets` - List authenticated user's pets
- `POST   /api/pets` - Add new pet profile
- `PUT    /api/pets/:id` - Update existing pet details
- `DELETE /api/pets/:id` - Delete pet profile

### Orders & Tracking (`/api/orders`) *(Protected)*
- `POST /api/orders/checkout` - Validate inventory, recalculate totals, and create order
- `GET  /api/orders` - View list of user's past and active orders
- `GET  /api/orders/:id` - Retrieve order details and step-by-step tracking timeline

### AI & Vision (`/api/ai`)
- `POST /api/ai/chat` - Interactive ChatGPT-style pet-care advice via Gemini API
- `POST /api/ai/scan-photo` - Multimodal vision analysis for uploaded pet images

---

## 🐾 Tested User Journey
1. **Welcome Screen:** Visited `/welcome`, viewed pet illustration, and launched into app.
2. **Phone OTP & Password Authentication:** Tested phone OTP code generation and instant login.
3. **Browse & Filter Catalog:** Filtered by Cat Food, Dog Food, Medicines, and sorted by price.
4. **Product Details:** Inspected Royal Canin Cat Food, Pedigree Dog Food, adjusted quantities, and added to Cart.
5. **Cart & Recalculation:** Inspected server-calculated subtotal, free shipping threshold, and total in INR (`₹`).
6. **Checkout & Payment:** Selected delivery address in Ahmedabad, chose UPI/Card/COD, and confirmed order.
7. **Order Success & Tracking:** Confetti burst, received order ID `#FS...`, and tracked stages from Confirmed to Delivered.
8. **AI Chat & Scanner:** Asked pet nutrition questions and tested pet photo inspection.
9. **My Pets:** Added pet profiles with age, breed, gender, and dietary care notes.
