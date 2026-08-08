# Avika API

Express + MongoDB backend for Avika.

## Architecture

```
server.js              entry point: connect DB, then listen
src/
  app.js               express app assembly (middleware + routes) — no listen() here, so it's testable
  config/
    env.js              validates required env vars at boot, exports typed config
    db.js                mongoose connection
  models/                Mongoose schemas: User, Kitchen, MenuItem, Order
  controllers/           request handlers — thin, delegate business logic to services
  services/              business logic that isn't tied to HTTP (pricing, tokens)
  middleware/            auth, error handling, rate limiting, validation
  routes/                one file per resource, mounted in routes/index.js
  validators/            express-validator rule sets
  seed/                  seed.js — populates dev data matching the frontend prototype
```

## Why it's structured this way

- **Controllers stay thin.** They parse the request, call a model or service, and respond. Pricing math lives in `services/orderService.js`, not copy-pasted into the controller — so the same logic can be reused or unit tested independently of Express.
- **Prices are never trusted from the client.** `orderService.buildOrderItems` re-reads price and availability from MongoDB for every item in a cart before creating an order.
- **One error shape everywhere.** Every failure — validation, auth, not-found, duplicate key — passes through `errorHandler` and comes back as `{ success: false, error: { message, details } }`.
- **`asyncHandler` removes try/catch boilerplate** from every controller; thrown errors are forwarded to Express automatically.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URL and JWT_SECRET at minimum
npm run seed            # optional: creates a test kitchen + menu + two users
npm run dev
```

Server starts on `http://localhost:4000`. Health check: `GET /api/health`.

## Auth flow

1. `POST /api/auth/register` or `/api/auth/login` → returns `{ user, token }`
2. Send the token on every subsequent request: `Authorization: Bearer <token>`
3. `GET /api/auth/me` returns the logged-in user

## Key endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/kitchens?lat=&lng=&radiusKm=` | none | nearby kitchen search (geo query) |
| GET | `/api/kitchens/:id/menu` | none | menu for a kitchen |
| POST | `/api/orders` | customer | place an order — server recalculates all pricing |
| GET | `/api/orders/mine` | customer | order history |
| PATCH | `/api/orders/:id/status` | cook/admin | advance order status (placed → accepted → preparing → out_for_delivery → delivered) |

## Not yet wired (next pass)

- Stripe PaymentIntent creation + webhook handler for card/UPI payments (COD works end-to-end today)
- Image upload endpoint (multer is installed, not yet routed)
- Admin-only endpoints for approving new kitchens
