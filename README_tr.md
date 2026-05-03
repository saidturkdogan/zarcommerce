# ZarCommerce

<p align="center">
  <img src="./frontend/main-site/public/logo.png" alt="ZarCommerce Logo" width="220" />
</p>

ZarCommerce, mikroservis mimarisi ile geliştirilmiş bir e-ticaret platformudur. Müşteri tarafı mağaza arayüzü, yönetici paneli ve modüler Spring Boot backend servislerinden oluşur.

## Dil

- İngilizce: `README.md`
- Türkçe: `README_tr.md`

## Canlı demo

- Mağaza: [zarcommerce-five.vercel.app/tr](https://zarcommerce-five.vercel.app/tr)
- Yönetim paneli: [zarcommerce-admin.vercel.app](https://zarcommerce-admin.vercel.app/)

## Genel Bakış

Proje iki ana bölümden oluşur:

- `backend`: Spring Boot mikroservisleri ve API Gateway
- `frontend`: Next.js main site ve Vite/React admin panel

### Backend Servisleri

- `api-gateway` (`8080`): dış istekleri ilgili servislere yönlendirir
- `user-service` (`8081`): kimlik doğrulama, profil, beğeniler, JWT güvenliği
- `product-service` (`8082`): ürün kataloğu ve ürün yönetimi
- `cart-service` (`8083`): sepet servisi (şu an daha hafif kapsamda)
- `order-service` (`8084`): sipariş görünümü ve ödeme verisi eşleme
- `payment-service` (`8085`): Iyzico ödeme başlatma, callback işleme, ödeme durum sorguları

### Frontend Uygulamaları

- `frontend/main-site`: müşteri arayüzü (`next`)
- `frontend/admin-panel`: yönetim paneli (`vite`)

## Teknoloji Yığını

- Backend: Java 17, Spring Boot, Spring Cloud Gateway, JPA/Hibernate
- Veri ve Mesajlaşma: PostgreSQL, RabbitMQ
- Frontend: Next.js 16, React 19, Vite, TypeScript, Tailwind CSS
- Araçlar: Docker, Docker Compose, Maven, GitHub Actions

## Klasör Yapısı

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

## Gereksinimler

- Java 17+
- Node.js 20+ ve npm
- Docker + Docker Compose (lokal altyapı için önerilir)

## Lokal Geliştirme

### 1) Altyapıyı başlat

Proje kök dizininde:

```bash
docker-compose up -d postgres rabbitmq
```

Bu komut şunları ayağa kaldırır:

- PostgreSQL: `localhost:5433`
- RabbitMQ: `localhost:5672`
- RabbitMQ Yönetim Paneli: `http://localhost:15672` (guest/guest)

### 2) Backend servislerini çalıştır

Her servisi ayrı terminalde başlat:

```bash
cd backend/api-gateway && ./mvnw spring-boot:run
cd backend/user-service && ./mvnw spring-boot:run
cd backend/product-service && ./mvnw spring-boot:run
cd backend/cart-service && ./mvnw spring-boot:run
cd backend/order-service && ./mvnw spring-boot:run
cd backend/payment-service && ./mvnw spring-boot:run
```

Windows için `./mvnw` yerine `mvnw.cmd` kullanabilirsin.

### 3) Frontend uygulamalarını çalıştır

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

## Ortam Değişkenleri Notları

- Birçok backend servisinde DB bağlantısı için `SPRING_DATASOURCE_*` kullanılır.
- `order-service` içinde `PAYMENT_SERVICE_BASE_URL` kullanılır.
- `payment-service` için:
  - `IYZICO_API_KEY`
  - `IYZICO_SECRET_KEY`
  - `IYZICO_BASE_URL`
  - `IYZICO_CALLBACK_URL`
  - `IYZICO_FRONTEND_BASE_URL`

Production ortamda örnek/sandbox değerler yerine mutlaka güvenli secret değerleri kullan.

## Docker ile Tam Çalıştırma

Tüm sistemi container olarak çalıştırmak için:

```bash
docker-compose up -d --build
```

Açılan portlar:

- Main Site: `3000`
- Admin Panel: `8088`
- API Gateway: `8080`
- User: `8081`
- Product: `8082`
- Cart: `8083`
- Order: `8084`
- Payment: `8085`

## Test

Backend testlerini toplu çalıştırma:

```bash
cd backend
mvn test
```

Tek servis test örneği:

```bash
cd backend/user-service
./mvnw test
```

## CI

`.github/workflows/backend-tests.yml` dosyasındaki GitHub Actions workflow'u, backend değişikliklerinde push ve pull request sırasında testleri çalıştırır.

## Lisans

Bu repo, repo sahibi tarafından açıkça belirtilmedikçe private/internal kullanım içindir.
