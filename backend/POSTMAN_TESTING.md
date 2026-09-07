# Postman / API handover testing guide

Base URL: `http://localhost:5000/api`

Set a Postman environment variable `baseUrl` = `http://localhost:5000/api` and `token` after login.

**Auth header for protected routes:**  
`Authorization: Bearer {{token}}`

---

## 0. Before you test

1. Start backend: `cd backend && npm run dev`
2. Confirm DB is reachable (Hostinger / local MySQL in `backend/.env`)
3. Run migration once on the DB:

```sql
-- file: database/migrations/004_handover_monetization.sql
```

4. Seed demo users if needed: `node src/config/seed.js` (from `backend`)
5. Health check:

`GET {{baseUrl}}/health` → `{ "status": "ok" }`

### Demo logins (typical seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | Admin@123 |
| Manager | manager@marketplace.com | Manager@123 |
| Vendor | vendor@marketplace.com | Vendor@123 |
| Customer | customer@marketplace.com | Customer@123 |

---

## 1. Auth

| Step | Method | URL | Body |
|------|--------|-----|------|
| Register | POST | `/auth/register` | `{ "name","email","password","phone?" }` |
| Login | POST | `/auth/login` | `{ "email","password" }` → save `token` |
| Me | GET | `/auth/me` | — |
| Forgot | POST | `/auth/forgot-password` | `{ "email" }` |
| Reset | POST | `/auth/reset-password` | `{ "token","password" }` |
| Phone OTP send | POST | `/auth/phone/send-otp` | `{ "phone" }` |
| Phone OTP verify | POST | `/auth/phone/verify-otp` | `{ "phone", "code" }` (or `"otp"`) |

Without SMTP/SMS configured, responses may include `devOtp` / `resetUrl` in development — use those in Postman.

**Phone OTP Postman example**

1. `POST /auth/phone/send-otp` body: `{ "phone": "9876543210" }` → copy `devOtp` and `phone` from response  
2. `POST /auth/phone/verify-otp` body:

```json
{
  "phone": "+919876543210",
  "code": "878385"
}
```

Use the exact `phone` returned by send-otp (usually `+91...`). Field name must be `code` (or `otp`).

**`/auth/me` 401 tip:** paste only the raw JWT string in Bearer Token (no `Bearer ` prefix, no quotes). Get a fresh token from login first.

---

## 2. Public catalog (no token)

No Authorization header. Method **GET** for all.

Base: `http://localhost:5000/api`

| Method | URL | Notes |
|--------|-----|-------|
| GET | `/businesses` | List/search |
| GET | `/businesses/1` | Detail by id (or slug if supported) |
| GET | `/businesses/1/products` | Products for business |
| GET | `/products` | Product list |
| GET | `/products/1` | Product detail |
| GET | `/categories` | All categories |
| GET | `/featured` | Featured businesses |
| GET | `/offers` | Public offers |
| GET | `/theme` | Homepage theme |
| GET | `/banners` | Homepage banners |
| GET | `/announcements` | Public announcements |
| GET | `/reviews?businessId=1` | **Requires** `businessId` or `slug` query |
| GET | `/platform/stats` | Platform counters |

**Postman:** Auth type = **No Auth**. Send each GET. Expect **200** and a `data` (or theme) payload.

**`/reviews` without query → 400** — that is correct. Use:

`GET http://localhost:5000/api/reviews?businessId=1`

---

## Real product flow (demo now = same path later)

Demo seed products (`Organic Honey`, etc.) already use the **same** APIs as future real products. There is no separate demo listing path on the backend.

| Step | Who | API | Result |
|------|-----|-----|--------|
| List public | anyone | `GET /products` | Only `status=published` + business `approved` |
| Detail | anyone | `GET /products/:id` | Same |
| Business products | anyone | `GET /businesses/:id/products` | Published only |
| Vendor create | vendor | `POST /vendor/products` | Creates as **`pending`** (not public yet) |
| Vendor update | vendor | `PUT /vendor/products/:id` | Updates DB; published stays listed |
| Approve | manager/admin | `PATCH /manager/products/:id/approve` or admin status | Sets **`published`** → appears in public list |

**Confirm demo now:** `GET http://localhost:5000/api/products` → 3 items.  
**When real products replace demo:** vendor creates → manager approves → same `GET /products` shows them. No FE rewiring needed.


1. `POST /customer/cart` `{ "productId": 1, "quantity": 1 }`
2. `GET /customer/cart`
3. Checkout COD (works without Razorpay):

```json
POST /customer/checkout
{
  "shippingAddress": "12 Test Street, City",
  "phone": "9876543210",
  "paymentMethod": "cod"
}
```

4. `GET /customer/orders` → note `order id`
5. `GET /customer/orders/:id`
6. `GET /customer/orders/:id/track`
7. `GET /customer/orders/:id/invoice` (HTML)
8. After order is `delivered` (vendor updates status):  
   `POST /customer/reviews` `{ "orderId", "businessId", "productId?", "rating": 5, "comment": "Good" }`
9. Refund:

```json
POST /customer/refunds
{ "orderId": 1, "reason": "Damaged item", "amount": 100 }
```

10. Dispute:

```json
POST /customer/disputes
{ "orderId": 1, "description": "Item not as described" }
```

11. Wallet: `GET /customer/wallet`  
    Top-up needs `PAYMENT_GATEWAY_*` → `POST /customer/wallet/topup` then `/wallet/topup/confirm`
12. Inquiry: `POST /customer/inquiries` `{ "businessId", "message", "name?", "email?", "phone?", "productId?" }`

**Online checkout** (`upi` / cards / net_banking): returns `501` until Razorpay keys are set. Then confirm with `POST /customer/payments/confirm`.

---

## 4. Vendor flow (vendor token)

1. `GET /vendor/dashboard`
2. `GET /vendor/profile` / `PUT /vendor/profile`
3. `GET /vendor/products` / `POST /vendor/products` (needs approved vendor)
4. `GET /vendor/orders` → `PATCH /vendor/orders/:id/status` `{ "status": "confirmed" }`  
   Allowed: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`
5. `GET /vendor/refunds` → `PATCH /vendor/refunds/:id` `{ "action": "approve" }`  
   Approving credits customer wallet and marks refund `processed`
6. Subscriptions:

```http
GET /vendor/memberships          → data = array of subscription_plans
GET /vendor/subscription
POST /vendor/subscription        { "plan_id": 1, "billing": "monthly" }
POST /vendor/subscription/confirm
{ "subscriptionId", "paymentId", "signature", "gatewayOrderId" }
```

Free/zero-fee plans activate immediately. Paid plans stay `pending` until confirm (needs gateway).

---

## 5. Admin / manager

**Admin token**

| Method | URL | Notes |
|--------|-----|-------|
| GET | `/admin/dashboard` | |
| GET | `/admin/analytics` | Charts/series |
| GET | `/admin/commissions` | |
| PATCH | `/admin/commissions/:id` | `{ "rate": 7.5 }` — applied on next checkout |
| GET | `/admin/commissions/earnings` | |
| GET | `/admin/users` | |
| PATCH | `/admin/theme` | Homepage theme |
| GET/POST | announcements / offers / categories / products / orders | |

**Manager token**

| Method | URL |
|--------|-----|
| GET | `/manager/dashboard` |
| GET | `/manager/disputes` |
| PATCH | `/manager/disputes/:id` | `{ "status": "resolved", "resolution": "..." }` |
| GET | `/manager/notifications` |

---

## 6. What is env-gated (expected)

| Feature | Env vars | Without keys |
|---------|----------|--------------|
| Online pay / wallet top-up / paid sub | `PAYMENT_GATEWAY_KEY`, `PAYMENT_GATEWAY_SECRET` | `501` |
| Email | `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` | Console / may return `resetUrl`/`devOtp` |
| SMS | `SMS_API_KEY`, `SMS_API_URL` | Console / may return `devOtp` |
| Google login | `GOOGLE_CLIENT_ID` | `501` |
| Uploads | Cloudinary keys | Upload routes fail |
| Maps embed | `GOOGLE_MAPS_API_KEY` | Fallback embed URL |

---

## 7. Suggested Postman collection order

1. Health  
2. Login (all 4 roles) — save tokens  
3. Public catalog  
4. Customer cart → COD checkout → orders → refund → dispute  
5. Vendor order status → approve refund  
6. Admin commission rate change → new COD checkout → verify `commission_amount` on order  
7. Vendor memberships + free subscription  
8. Admin analytics + platform stats  

---

## 8. Handover checklist

- [ ] `/api/health` OK  
- [ ] Register + login + `/auth/me`  
- [ ] COD checkout creates DB order with commission from `commission_settings`  
- [ ] Vendor can update order status  
- [ ] Customer refund → vendor approve → wallet credited once (replay confirm safe)  
- [ ] Customer dispute appears for manager  
- [ ] `/vendor/memberships` returns plan **array** in `data`  
- [ ] Paid subscription confirm endpoint exists  
- [ ] Online pay returns clear `501` when gateway missing  
- [ ] Migration `004_handover_monetization.sql` applied  
