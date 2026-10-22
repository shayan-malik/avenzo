# Avenzo - Full-Stack E-Commerce App

> Everything You Need, One Place.

Avenzo ek full-stack e-commerce web app hai jisme users products browse kar sakte hain, cart mein add kar sakte hain aur order place kar sakte hain. Admin apne panel se products, categories aur orders manage karta hai.

## Live Demo

- **Frontend:** https://avenzo-plum.vercel.app/
- **Backend API:** https://avenzo-ecommerce.vercel.app/

## Screenshots

| Home / Products | Product Detail |
| --- | --- |
| ![Products](docs/screenshots/products.png) | ![Product Detail](docs/screenshots/product-detail.png) |

| Cart | Orders |
| --- | --- |
| ![Cart](docs/screenshots/cart.png) | ![Orders](docs/screenshots/orders.png) |

| Login | Admin Panel |
| --- | --- |
| ![Login](docs/screenshots/login.png) | ![Admin](docs/screenshots/admin.png) |

## Features

**User**
- Signup, login, logout (JWT httpOnly cookie ke saath, password bcrypt se hash)
- Products list with search (debounce), category filter, sorting aur pagination
- Product detail page, quantity selector, Add to Cart aur Buy Now
- Cart: quantity update, item remove, total, shipping address
- Checkout: order place karna, apne orders aur unka status dekhna
- Profile view / update / delete (soft delete)

**Admin**
- Admin-only panel (role-based access)
- Orders: sab orders dekhna, status filter, status change, cancel (cancel par stock wapas)
- Categories aur Products add karna

**Backend highlights**
- Checkout PostgreSQL transaction mein hota hai (order create + stock decrement + cart clear)
- Order items mein price ki copy save hoti hai, taake baad mein price change se purane orders na badlein
- Saari queries parameterized (placeholders), SQL injection se bachav
- `verifyToken` aur `requireRole` middleware, aur har request par user ka `is_active` check

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS v4, React Router, Axios, react-hot-toast, lucide-react |
| Backend | Node.js, Express (ES modules), JWT, bcrypt |
| Database | PostgreSQL on Neon (plain `pg`, no ORM) |
| Deployment | Vercel (frontend aur backend dono) |

## API Overview

| Route group | Access | Kaam |
| --- | --- | --- |
| `/api/auth` | Public | Signup, login, logout |
| `/api/profile` | Logged in | Profile get / update / delete |
| `/api/categories` | GET public, POST admin | Categories list aur add |
| `/api/products` | GET public, POST admin | List (search/filter/sort/pagination), detail, add |
| `/api/cart` | Logged in | Cart get, add, quantity update, remove |
| `/api/orders` | Logged in / admin | Checkout, my orders, admin all orders + status update |

## Run Locally

### 1. Backend

```bash
git clone https://github.com/shayan-malik/avenzo-ecommerce
cd avenzo-ecommerce
npm install
```

`.env` file banao:

```env
PGHOST=your-neon-host
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGPORT=5432
JWT_SECRET=any-long-random-string
```

```bash
npm run dev
```

Server `http://localhost:5000` par chalega.

### 2. Frontend

```bash
git clone <frontend-repo-url>
cd ecommerce-client
npm install
npm run dev
```

Vite proxy `/api` ko automatically `http://localhost:5000` par bhej deta hai.

## Project Structure (Backend)

```
.
├── db.js                  # pg Pool (Neon)
├── server.js              # Express app
├── middleware/
│   └── authMiddleware.js  # verifyToken, requireRole
└── routes/
    ├── auth.js
    ├── profile.js
    ├── categories.js
    ├── products.js
    ├── cart.js
    └── orders.js
```

## Future Improvements

- Products aur categories ka edit / delete
- Cloudinary se image upload
- Product reviews aur ratings
- Mobile navbar menu

## Author

**Shayan Malik**
- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-profile
