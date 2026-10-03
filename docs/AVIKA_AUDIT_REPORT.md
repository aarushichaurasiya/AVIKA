# AVIKA — Project Audit Report

**Project:** Avika — From Local Kitchens, With Love  
**Repository:** https://github.com/aarushichaurasiya/AVIKA  
**Audit type:** Repository/source audit  
**Audit date:** October 2026  
**Scope:** Repository structure, documentation, dependency configuration, application architecture, security controls visible in source, and portfolio-readiness.

> **Audit note:** This report is a source/repository review. It does not claim a production penetration test, live-load test, payment-provider certification, or exhaustive runtime test suite unless explicitly documented in the repository.

---

## 1. Executive Summary

AVIKA is a MERN-based food-delivery platform designed around customers discovering local kitchens, browsing menus, placing orders, and tracking order history, while kitchen/admin users manage menus, orders, employees, and operational metrics.

The repository is organized as three active applications:

- **Customer frontend:** React + Vite
- **Kitchen/admin frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB/Mongoose

The repository also contains a screenshot evidence set and documentation covering architecture, setup, API routes, roles, order flow, location-based discovery, security notes, and future hardening.

### Audit conclusion

The project demonstrates meaningful full-stack breadth: two React clients, a shared REST API, MongoDB data modeling, authentication/authorization, geospatial discovery, checkout/payment flow, role-aware kitchen operations, and operational dashboards.

The main gap is **production hardening rather than core feature breadth**. The README itself identifies automated testing, CI/CD, monitoring/logging, production deployment, image storage, payment hardening, performance optimization, and security/rate-limit tuning as future work.

---

## 2. Architecture Review

```text
                    AVIKA
                       |
          +------------+------------+
          |                         |
   Customer React App       Kitchen/Admin React App
      Vite :5173                 Vite :5174
          |                         |
          +------------+------------+
                       |
                 Express REST API
                      :4000
                       |
                MongoDB / Mongoose
```

### Observations

- The customer and kitchen/admin applications are separated, which keeps user-facing workflows distinct.
- Both clients communicate with a shared backend API.
- The backend is organized around Express, Mongoose, authentication middleware, controllers/routes, validation, and service logic.
- The README documents a clear order lifecycle from kitchen discovery through checkout and kitchen fulfillment.

**Assessment:** The overall architecture is appropriate for a student full-stack project and provides a credible basis for demonstrating frontend, backend, database, and authorization skills.

---

## 3. Technology & Dependency Review

### Customer application

The customer app uses React 18, Vite, React Router, Axios, and Leaflet. fileciteturn14file0

### Kitchen/admin application

The kitchen/admin app uses React 18, Vite, React Router, and Axios. fileciteturn15file0

### Backend

The backend uses Express, Mongoose, JWT, bcryptjs, validation middleware, Helmet, CORS, compression, request logging, rate limiting, Mongo sanitization, Multer, and Stripe integration. fileciteturn13file0

### Positive controls visible from dependencies

- Password hashing via `bcryptjs`
- JWT-based authentication
- Request validation via `express-validator`
- HTTP security headers via `helmet`
- Rate limiting via `express-rate-limit`
- MongoDB query sanitization via `express-mongo-sanitize`
- Compression and request logging
- Stripe SDK for payment integration

**Assessment:** The dependency selection shows awareness of common API security and operational concerns.

---

## 4. Functional Coverage

| Area | Evidence in repository | Status |
|---|---|---|
| Customer authentication | Auth endpoints and documented role model | Implemented |
| Kitchen discovery | Geospatial search + kitchen routes | Implemented |
| Menu browsing | Kitchen menu endpoint and UI | Implemented |
| Cart | Customer ordering flow | Implemented |
| Checkout/payment | Payment flow + Stripe dependency | Implemented |
| Order creation | `/api/orders` documented | Implemented |
| Order history | `/api/orders/mine` documented | Implemented |
| Kitchen order management | Kitchen order UI/screenshots | Implemented |
| Menu management | Kitchen management UI/screenshots | Implemented |
| Employee/role management | Kitchen employee UI/screenshots | Implemented |
| Kitchen dashboard | Dashboard screenshot + README | Implemented |
| Kitchen approval workflow | Documented platform workflow | Implemented |
| Location-based discovery | GeoJSON + `2dsphere` documentation | Implemented |
| Automated test suite | Not documented as complete | Future work |
| CI/CD | Not documented as complete | Future work |
| Production monitoring | Not documented as complete | Future work |

---

## 5. Security Review

### Controls identified

The backend dependency configuration includes several useful security controls: password hashing, JWT authentication, validation, Helmet, rate limiting, and MongoDB sanitization. fileciteturn13file0

The README also explicitly warns against committing environment secrets and recommends HTTPS, restricted MongoDB access, secure CORS configuration, credential rotation, and authentication/authorization review.

### Remaining security work

For a real production deployment, the following should be verified with tests rather than assumed from dependencies alone:

1. JWT expiry and refresh/revocation behavior
2. Authorization checks on every privileged route
3. CORS allow-list behavior in production
4. Rate-limit thresholds and bypass resistance
5. Input validation coverage for every write endpoint
6. Secure file-upload validation and storage
7. Payment webhook signature verification and idempotency
8. Protection against duplicate order/payment submissions
9. MongoDB network restrictions and least-privilege credentials
10. Secret management outside `.env` files in production

**Important:** A dependency being installed does not by itself prove that the control is correctly applied to every route.

---

## 6. Data & Business Logic Review

The documented order flow is:

```text
Customer
   -> Select Kitchen
   -> Select Food
   -> Cart
   -> Checkout / Payment
   -> Order Placed
   -> Kitchen Accepts
   -> Kitchen Prepares
   -> Status Update
   -> Customer Order History
```

A particularly good design decision documented in the repository is server-side order-price calculation rather than trusting client-provided prices.

The project also documents GeoJSON `Point` storage and MongoDB `2dsphere` indexing for location-based kitchen discovery.

### Recommended hardening

- Add explicit order-state transition tests.
- Make payment and order creation idempotent.
- Add database indexes based on actual query patterns.
- Validate ownership for customer order reads and kitchen operations.
- Add transaction/consistency handling around payment and order state where appropriate.

---

## 7. Documentation & Evidence Review

The README is unusually useful for a student project because it documents:

- Architecture
- Tech stack
- Project structure
- Screenshots
- Local setup
- Environment variables
- API routes
- Geospatial discovery
- Order flow
- Roles
- Development notes
- Security notes
- Roadmap

The repository also contains a dedicated screenshot set covering customer and kitchen workflows. fileciteturn10file0

### Portfolio value

The screenshots provide concrete UI evidence instead of relying only on a project description. This makes AVIKA suitable as a featured portfolio project.

---

## 8. Production Readiness Gap Analysis

| Category | Current evidence | Recommended next step |
|---|---|---|
| Core features | Broad feature coverage | Preserve current flows |
| Authentication | JWT + password hashing | Add auth integration tests |
| Authorization | Role-based behavior documented | Add route-level authorization tests |
| API security | Helmet, validation, rate limiting, sanitization | Verify coverage and production configuration |
| Payments | Stripe integration | Add webhook/idempotency tests |
| Database | MongoDB/Mongoose + geospatial model | Add indexes and query tests based on usage |
| Testing | Not documented as comprehensive | Add unit + API + critical E2E tests |
| Deployment | Listed as future work | Deploy frontend/backend with production secrets |
| Observability | Listed as future work | Add structured logs + error monitoring |
| CI/CD | Listed as future work | Add GitHub Actions for lint/build/test |
| Media storage | Listed as future work | Use durable object storage for uploads |
| Performance | Listed as future work | Add caching and query optimization where measured |

---

## 9. Recommended Upgrade Path

### Phase 1 — Testing

- Backend unit tests for services/controllers
- API integration tests for auth, kitchens, orders, and payments
- Critical customer checkout E2E test
- Kitchen order-state E2E test

### Phase 2 — Deployment

- Deploy customer frontend
- Deploy kitchen/admin frontend
- Deploy backend API
- Use managed MongoDB
- Configure production CORS and HTTPS
- Store secrets in the deployment platform rather than Git

### Phase 3 — Observability

- Structured application logs
- Centralized error monitoring
- Health endpoint
- Request latency metrics
- Payment failure visibility

### Phase 4 — Engineering polish

- GitHub Actions CI
- ESLint/formatting checks
- Automated build verification
- API documentation/OpenAPI
- Database indexes based on measured queries
- Image/object storage
- Pagination and caching for larger datasets

---

## 10. Portfolio Assessment

AVIKA is strong evidence of **full-stack application development** because it demonstrates more than a single CRUD screen:

- Two separate React applications
- Shared Express API
- MongoDB/Mongoose persistence
- Authentication and roles
- Geospatial discovery
- Cart and checkout
- Payment integration
- Customer order history
- Kitchen operations
- Employee management
- Dashboard metrics

For a resume or portfolio, the strongest framing is to emphasize the **system architecture and workflow**, not simply "food delivery website."

### Suggested portfolio summary

> Built a MERN-based local-kitchen food delivery platform with separate customer and kitchen/admin applications, a shared Express + MongoDB API, JWT authentication, geospatial kitchen discovery, checkout/payment flow, order lifecycle management, and role-based kitchen operations.

---

## 11. Final Audit Notes

**Overall repository maturity:** Feature-rich student full-stack project with clear production-hardening opportunities.

**Strongest evidence:** Multi-application architecture, documented API/business workflows, role-aware kitchen operations, geospatial discovery, payment integration, and screenshot-based feature evidence.

**Primary next milestone:** Add automated testing + CI/CD + deployment/observability so the project can move from a feature-complete portfolio application toward a demonstrably production-ready system.

**Audit limitation:** This report is based on repository documentation and source/configuration evidence available in the repository. It should not be interpreted as a security certification or production penetration-test report.
