# Nowon Shop

A full-stack e-commerce web application built as a portfolio project for backend developer job applications in Japan.

---

## Tech Stack

### Backend
| Category | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3, Spring Security |
| ORM | Spring Data JPA (Hibernate) |
| Authentication | JWT |
| Database | MySQL 8 |
| Build | Gradle |

### Frontend
| Category | Technology |
|---|---|
| Language | TypeScript |
| Framework | React 19 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Build | Vite |

---

## Project Structure

```
nowon-shop/
├── nowon-server   # Spring Boot REST API (port 8080)
├── nowon-admin    # Admin dashboard — React + TypeScript (port 5173)
└── nowon-user     # Customer storefront — React + TypeScript (port 5174)
```

---

## Features

### Customer Storefront (`nowon-user`)
- Browse products without authentication
- User registration and login (JWT-based)
- Product detail page with quantity selector
- Place orders
- View personal order history

### Admin Dashboard (`nowon-admin`)
- Secure login with role-based access control
- Dashboard with summary cards and recent orders
- Product management — create, read, update, delete
- Member management — list, block, activate
- Order management — status update, cancel

### Backend API (`nowon-server`)
- RESTful API with consistent response format (`ApiResponse<T>`)
- JWT authentication with stateless session
- Role-based authorization (`ROLE_USER`, `ROLE_ADMIN`)
- Global exception handling (`@ControllerAdvice`)
- Pessimistic locking (`PESSIMISTIC_WRITE`) to prevent overselling on concurrent orders
- N+1 problem prevention with `JOIN FETCH`
- Order price snapshot — stores price at time of order, independent of future price changes

---

## Key Design Decisions

### Pessimistic Locking for Inventory
When multiple users order the same product simultaneously, a race condition can cause stock to go negative. This project uses `PESSIMISTIC_WRITE` lock on product retrieval during order creation to serialize concurrent requests and guarantee stock consistency.

### Order Price Snapshot
`OrderItem.orderPrice` stores the product price at the time of purchase. This ensures order history remains accurate even if the product price is later updated.

### Security
- Login errors return the same message regardless of whether the email or password is wrong, preventing account enumeration attacks.
- Stack traces are never exposed to clients; all exceptions are handled centrally by `GlobalExceptionHandler`.

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8

### Backend Setup

1. Create a MySQL database:
```sql
CREATE DATABASE nowon_shop;
```

2. Copy and configure the application settings:
```bash
cp nowon-server/src/main/resources/application.yaml.sample \
   nowon-server/src/main/resources/application.yaml
```

3. Edit `application.yaml` with your database credentials and a JWT secret (32+ characters).

4. Run the server:
```bash
cd nowon-server
./gradlew bootRun
```

### Frontend Setup

**Admin dashboard**
```bash
cd nowon-admin
npm install
npm run dev
# → http://localhost:5173
```

**Customer storefront**
```bash
cd nowon-user
npm install
npm run dev
# → http://localhost:5174
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | List all available products |
| GET | `/api/products/{id}` | None | Get product detail |
| POST | `/api/admin/products` | ADMIN | Create product |
| PUT | `/api/admin/products/{id}` | ADMIN | Update product |
| DELETE | `/api/admin/products/{id}` | ADMIN | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | USER | Place an order |
| GET | `/api/orders` | USER | Get my orders |
| PATCH | `/api/orders/{id}/cancel` | USER | Cancel an order |
| GET | `/api/admin/orders` | ADMIN | List all orders |
| PATCH | `/api/admin/orders/{id}/status` | ADMIN | Update order status |

### Members
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/members` | ADMIN | Create member |
| GET | `/api/admin/members` | ADMIN | List all members |
| PATCH | `/api/admin/members/{id}/status` | ADMIN | Block or activate member |
