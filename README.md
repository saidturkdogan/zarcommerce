# ZarCommerce

<p align="center">
  <img src="./frontend/main-site/public/logo.png" alt="ZarCommerce Logo" width="220" />
</p>

ZarCommerce is a microservices-based e-commerce platform with a customer-facing storefront, an admin dashboard, and a modular Spring Boot backend.

## Language

- English: `README.md`
- Turkish: `README_tr.md`

## Overview

The project is split into two top-level areas:

- `backend`: Spring Boot microservices and API Gateway
- `frontend`: Next.js main site and Vite/React admin panel

### Backend Services

- `api-gateway` (`8080`): routes external API traffic to internal services
- `user-service` (`8081`): authentication, profile, wishlist, JWT security
- `product-service` (`8082`): product catalog and product management
- `cart-service` (`8083`): cart service bootstrap (currently lightweight)
- `order-service` (`8084`): order list mapping and payment aggregation
- `payment-service` (`8085`): Iyzico payment initialization, callback handling, status queries

### Frontend Apps

- `frontend/main-site`: customer storefront (`next`)
- `frontend/admin-panel`: admin dashboard (`vite`)

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Cloud Gateway, JPA/Hibernate
- Datastore & Messaging: PostgreSQL, RabbitMQ
- Frontend: Next.js 16, React 19, Vite, TypeScript, Tailwind CSS
- Tooling: Docker, Docker Compose, Maven, GitHub Actions

## Repository Structure

```text
zarcommerce/
├─ backend/
│  ├─ api-gateway/
│  ├─ user-service/
│  ├─ product-service/
│  ├─ cart-service/
│  ├─ order-service/
│  ├─ payment-service/
│  └─ pom.xml
├─ frontend/
│  ├─ main-site/
│  └─ admin-panel/
├─ docker-compose.yml
└─ README.md
```

## Prerequisites

- Java 17+
- Node.js 20+ and npm
- Docker + Docker Compose (recommended for local infrastructure)

## Local Development

### 1) Start infrastructure

From repository root:

```bash
docker-compose up -d postgres rabbitmq
```

This starts:

- PostgreSQL on `localhost:5433`
- RabbitMQ on `localhost:5672`
- RabbitMQ Management UI on `http://localhost:15672` (guest/guest)

### 2) Run backend services

Start each service in a separate terminal:

```bash
cd backend/api-gateway && ./mvnw spring-boot:run
cd backend/user-service && ./mvnw spring-boot:run
cd backend/product-service && ./mvnw spring-boot:run
cd backend/cart-service && ./mvnw spring-boot:run
cd backend/order-service && ./mvnw spring-boot:run
cd backend/payment-service && ./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd` instead of `./mvnw`.

### 3) Run frontend apps

Main site:

```bash
cd frontend/main-site
npm install
npm run dev
```

Admin panel:

```bash
cd frontend/admin-panel
npm install
npm run dev
```

## Environment Notes

- Most backend services use `SPRING_DATASOURCE_*` variables for DB connection.
- `order-service` uses `PAYMENT_SERVICE_BASE_URL`.
- `payment-service` uses:
  - `IYZICO_API_KEY`
  - `IYZICO_SECRET_KEY`
  - `IYZICO_BASE_URL`
  - `IYZICO_CALLBACK_URL`
  - `IYZICO_FRONTEND_BASE_URL`

For production, always replace sample/sandbox values with secure secrets.

## Docker (Full Stack)

To run almost the full stack with containers:

```bash
docker-compose up -d --build
```

Exposed ports:

- Main Site: `3000`
- Admin Panel: `8088`
- API Gateway: `8080`
- User: `8081`
- Product: `8082`
- Cart: `8083`
- Order: `8084`
- Payment: `8085`

## Testing

Backend tests:

```bash
cd backend
mvn test
```

Service-level tests (example):

```bash
cd backend/user-service
./mvnw test
```

## CI

GitHub Actions workflow at `.github/workflows/backend-tests.yml` runs backend tests on push and pull requests when backend files change.

## License

This project is currently private/internal unless explicitly licensed by the repository owner.
