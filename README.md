# Nowon Shop

> Full-stack e-commerce application built as a portfolio project for backend developer positions in Japan.

**Live Demo**

| Service | URL |
|---|---|
| Customer Storefront | https://nowon-shop.vercel.app |
| Admin Dashboard | https://nowon-shop-iexs.vercel.app |
| REST API | https://nowon-shop-production.up.railway.app |
| API Docs (Swagger) | https://nowon-shop-production.up.railway.app/swagger-ui/index.html |

---

## Tech Stack

### Backend
| Category | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4, Spring Security |
| ORM | Spring Data JPA (Hibernate) |
| Authentication | JWT (stateless) |
| Database | MySQL |
| Payment | Stripe |
| Image Upload | Cloudinary |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Build | Gradle |
| Deployment | Railway |

### Frontend
| Category | Technology |
|---|---|
| Language | TypeScript |
| Framework | React 19 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Build Tool | Vite |
| Deployment | Vercel |

---

## Project Structure

```
nowon-shop/
├── nowon-server/   # Spring Boot REST API
│   └── src/main/java/com/nowon/shop/
│       ├── api/          # Controllers & DTOs (admin / user / auth / payment)
│       ├── domain/       # Entities, Repositories, Services
│       │   ├── member/
│       │   ├── order/
│       │   ├── product/
│       │   └── payment/
│       └── global/       # Security, Exception handling, Common response
├── nowon-admin/    # Admin dashboard — React + TypeScript
└── nowon-user/     # Customer storefront — React + TypeScript
```

---

## Features

### Customer Storefront
- Landing page with hero section, category shortcuts, and new arrivals
- Browse products without login
- Keyword search with debounce (400ms) and category filter (server-side)
- Server-side pagination (8 items per page)
- User registration and login
- Product detail page with quantity selector and real-time total price
- Add to cart (persisted in localStorage) or buy instantly
- Multi-item cart with quantity controls and bulk checkout
- Stripe payment integration — card, KakaoPay, NaverPay, and more
- View order history with status tracking and cancel option
- Skeleton loading / toast messages / error state UI

### Admin Dashboard
- Secure login with role-based access control
- Dashboard with summary cards (members / products / orders) and recent orders
- Product management — create, read, update, delete with image upload (Cloudinary)
- Member management — list, block, activate
- Order management — status update, cancel

### Backend API
- RESTful API with unified response format (`ApiResponse<T>`, `PageResponse<T>`)
- JWT authentication — stateless, role-based (`ROLE_USER`, `ROLE_ADMIN`)
- Global exception handling via `@ControllerAdvice`
- Pessimistic locking (`PESSIMISTIC_WRITE`) for inventory consistency under concurrent orders
- N+1 problem prevention with `JOIN FETCH`
- Server-side search, category filter, and pagination using JPQL + Spring Data `Pageable`
- Order price snapshot — `OrderItem.orderPrice` preserves the price at time of purchase
- Stripe Webhook integration — signature verification, order status update on payment result
- Swagger UI with JWT authentication support

---

## Key Design Decisions

### Pessimistic Locking for Inventory
When multiple users order the same product simultaneously, a race condition can drive stock negative.  
This project applies `PESSIMISTIC_WRITE` on product retrieval during order creation, serializing concurrent requests and guaranteeing stock consistency.

```java
// ProductRepository.java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdWithLock(@Param("id") Long id);
```

### Order Price Snapshot
`OrderItem.orderPrice` stores the product price at the time of purchase.  
This ensures order history stays accurate even after a product price update.

```java
// OrderService.java
OrderItem orderItem = OrderItem.builder()
    .order(order)
    .product(product)
    .orderPrice(product.getPrice()) // snapshot at order time
    .quantity(quantity)
    .build();
```

### Stripe Payment Flow
Order is created with `PENDING` status first, then the client initializes Stripe Elements using a `clientSecret` returned from the backend.  
On payment completion, Stripe sends a Webhook event to the backend. The backend verifies the signature and updates the order to `PAID` or `CANCELLED`.

```
Frontend: create order (PENDING) → request PaymentIntent → show Stripe Elements
Backend:  create PaymentIntent with orderId in metadata → return clientSecret
Stripe:   process payment → send Webhook (payment_intent.succeeded / payment_failed)
Backend:  verify signature → parse orderId from raw JSON → update order status
```

### Server-side Search & Pagination
Filtering and pagination run at the database level using JPQL with dynamic parameters and Spring Data `Pageable`.  
Performance stays consistent regardless of data volume, avoiding the memory overhead of in-memory filtering.

### Layered Exception Handling
`ErrorCode` (enum) → `BusinessException` (runtime) → `GlobalExceptionHandler` (`@ControllerAdvice`)  
Stack traces are never exposed to clients. All errors return a structured `ApiResponse` with an appropriate HTTP status.

### Security Considerations
- Login errors return the same message whether the email or password is wrong, preventing account enumeration.
- `@Transactional(readOnly = true)` is set as the class-level default; write methods override with `@Transactional`.
- Stripe Webhook requests are verified using the signature header before processing.
- Swagger UI can be disabled in production via Spring Profile — currently enabled for demo purposes.

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT |

### Products (Public)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | List products (search, category, pagination) |
| GET | `/api/products/categories` | None | List categories |
| GET | `/api/products/{id}` | None | Get product detail |

### Products (Admin)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/products` | ADMIN | List all products |
| GET | `/api/admin/products/{id}` | ADMIN | Get product detail |
| POST | `/api/admin/products` | ADMIN | Create product |
| PUT | `/api/admin/products/{id}` | ADMIN | Update product |
| DELETE | `/api/admin/products/{id}` | ADMIN | Delete product |
| POST | `/api/admin/images/upload` | ADMIN | Upload product image (Cloudinary) |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | USER | Place an order (multi-item) |
| GET | `/api/orders` | USER | Get my orders |
| GET | `/api/orders/{id}` | USER | Get order detail |
| PATCH | `/api/orders/{id}/cancel` | USER | Cancel my order |
| GET | `/api/admin/orders` | ADMIN | List all orders |
| PATCH | `/api/admin/orders/{id}/status` | ADMIN | Update order status |
| PATCH | `/api/admin/orders/{id}/cancel` | ADMIN | Cancel order (admin) |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/intent/{orderId}` | USER | Create Stripe PaymentIntent |
| POST | `/api/payments/webhook` | None | Stripe Webhook receiver |

### Members (Admin)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/members` | ADMIN | Create member |
| GET | `/api/admin/members` | ADMIN | List all members |
| PATCH | `/api/admin/members/{id}/status` | ADMIN | Block or activate member |

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL
- Stripe account (test mode)
- Cloudinary account

### Backend Setup

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE nowon_shop;"

# 2. Configure application settings
# Edit nowon-server/src/main/resources/application.yaml
# → DB credentials, JWT secret (32+ chars), Stripe keys, Cloudinary keys

# 3. Run the server
cd nowon-server
./gradlew bootRun
# → http://localhost:8080
```

### Frontend Setup

```bash
# Admin dashboard
cd nowon-admin
npm install
npm run dev
# → http://localhost:5173

# Customer storefront
cd nowon-user
cp .env.local.example .env.local
# → Set VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
# → http://localhost:5174
```

### Stripe Local Webhook (optional)

```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:8080/api/payments/webhook
# → Copy the whsec_... secret to application.yaml stripe.webhook-secret
```

---

## Development History

| Phase | Description |
|---|---|
| 1 | Database schema design — members, products, orders, order_items |
| 2 | Backend domain layer — JPA entities, repositories, service logic |
| 3 | Spring Security + stateless JWT authentication |
| 4 | Global exception handling — `ErrorCode` / `BusinessException` / `GlobalExceptionHandler` |
| 5 | Pessimistic locking for concurrent order safety |
| 6 | Admin dashboard — full CRUD UI with React + TailAdmin |
| 7 | Public product API + user registration endpoint |
| 8 | Customer storefront — built from scratch with React + Tailwind CSS |
| 9 | Server-side search, category filter, and pagination |
| 10 | Swagger UI with JWT auth integration |
| 11 | Multi-item cart with localStorage persistence |
| 12 | Stripe payment integration — PaymentIntent flow + Webhook handling |
| 13 | Landing page, auth-aware UI, SPA routing fix (vercel.json) |
| 14 | Deployment — Railway (backend + MySQL) / Vercel (frontend) |
