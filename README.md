# Multi-Business Marketplace Platform

Centralized digital marketplace for businesses of all sizes — multi-vendor e-commerce, business profiles, store locator, and role-based dashboards.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite), HTML5, CSS3, JavaScript |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + RBAC (Super Admin, Manager, Vendor, Customer) |
| Integrations | Payment (Razorpay-ready), SMS, Email, Google Maps |

## Quick start

### 1. Database
```bash
cd backend
cp .env.example .env
# set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
npm run db:migrate
npm run db:seed
```

### 2. Backend
```bash
cd backend
npm run dev
# http://localhost:5000/api/health
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@marketplace.com | Admin@123 |
| Business Manager | manager@marketplace.com | Manager@123 |
| Vendor | vendor@marketplace.com | Vendor@123 |
| Customer | customer@marketplace.com | Customer@123 |

## Features implemented

- Auth: register → login, Google, phone OTP (DB), email OTP verify, password reset
- Payments: COD/wallet real; Razorpay when keys set; no silent mock paid
- Public catalog: search, categories, products, businesses, theme, banners, announcements, reviews
- Vendor / customer / manager / admin role APIs with live DB access checks
- Notifications for orders, products, announcements
- Analytics & commission earnings from MySQL (no demo charts)

## Production env keys

Set these in `backend/.env` for full live behavior:

- `PAYMENT_GATEWAY_KEY` / `PAYMENT_GATEWAY_SECRET` (Razorpay)
- `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM`
- `SMS_API_URL` / `SMS_API_KEY` / `SMS_SENDER_ID`
- Matching `NEXT_PUBLIC_RAZORPAY_KEY_ID` on frontend

## Project structure

```
multi-business-marketplace/
├── docs/
├── database/schema.sql
├── backend/          # Express API
└── frontend/         # React Vite app
```

## Tests

```bash
cd backend
node src/tests/smoke.test.js
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/SECURITY.md](docs/SECURITY.md).

## License

Private — All rights reserved.
"# MultiBusiness" 
