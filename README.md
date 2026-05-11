# Nowon Shop

> Full-stack e-commerce application built as a portfolio project for backend developer positions in Japan.

**Live Demo**

| Service | URL |
|---|---|
| Customer Storefront | https://nowon-shop.vercel.app |
| Admin Dashboard | https://nowon-shop-2q48.vercel.app |
| REST API | https://nowon-shop-production.up.railway.app |
| API Docs (Swagger) | https://nowon-shop-production.up.railway.app/swagger-ui/index.html |

---

## Screenshots

> _Screenshots coming soon_

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
│       ├── api/          # Controllers & DTOs (admin / user / auth)
│       ├── domain/       # Entities, Repositories, Services
│       │   ├── member/
│       │   ├── order/
│       │   └── product/
│       └── global/       # Security, Exception handling, Common response
├── nowon-admin/    # Admin dashboard — React + TypeScript
└── nowon-user/     # Customer storefront — React + TypeScript
```

---

## Features

### Customer Storefront
- Browse products without login
- Keyword search with debounce (400ms) and category filter (server-side)
- Server-side pagination (8 items per page)
- User registration and login
- Product detail page with quantity selector and real-time total price
- Place orders
- View order history with status and cancel option
- Skeleton loading / toast messages / error state UI

### Admin Dashboard
- Secure login with role-based access control
- Dashboard with summary cards (members / products / orders) and recent orders
- Product management — create, read, update, delete
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
- 15 unit/integration tests passing
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

### Server-side Search & Pagination
Filtering and pagination run at the database level using JPQL with dynamic parameters and Spring Data `Pageable`.  
Performance stays consistent regardless of data volume, avoiding the memory overhead of in-memory filtering.

### Layered Exception Handling
`ErrorCode` (enum) → `BusinessException` (runtime) → `GlobalExceptionHandler` (`@ControllerAdvice`)  
Stack traces are never exposed to clients. All errors return a structured `ApiResponse` with an appropriate HTTP status.

### Security Considerations
- Login errors return the same message whether the email or password is wrong, preventing account enumeration.
- `@Transactional(readOnly = true)` is set as the class-level default; write methods override with `@Transactional`.
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
| POST | `/api/admin/products` | ADMIN | Create product |
| PUT | `/api/admin/products/{id}` | ADMIN | Update product |
| DELETE | `/api/admin/products/{id}` | ADMIN | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | USER | Place an order |
| GET | `/api/orders` | USER | Get my orders |
| PATCH | `/api/orders/{id}/cancel` | USER | Cancel my order |
| GET | `/api/admin/orders` | ADMIN | List all orders |
| PATCH | `/api/admin/orders/{id}/status` | ADMIN | Update order status |
| PATCH | `/api/admin/orders/{id}/cancel` | ADMIN | Cancel order (admin) |

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

### Backend Setup

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE nowon_shop;"

# 2. Copy and configure application settings
cp nowon-server/src/main/resources/application.yaml.sample \
   nowon-server/src/main/resources/application.yaml
# → Edit DB credentials and JWT secret (32+ characters)

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
npm install
npm run dev
# → http://localhost:5174
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
| 6 | Unit and integration tests (15 passing) |
| 7 | Admin dashboard — full CRUD UI with React + TailAdmin |
| 8 | Public product API + user registration endpoint |
| 9 | Customer storefront — built from scratch with React + Tailwind CSS |
| 10 | Server-side search, category filter, and pagination |
| 11 | Swagger UI with JWT auth integration |
| 12 | Deployment — Railway (backend + MySQL) / Vercel (frontend) |
