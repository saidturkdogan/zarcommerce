# ZarCommerce - E-Ticaret Uygulaması

ZarCommerce, modüler mikroservis mimarisine dayanan, kullanıcılara özelleştirilmiş ve dinamik alışveriş deneyimi sunmayı hedefleyen kapsamlı bir e-ticaret platformudur.

## Proje Yapısı

Proje temel olarak iki ana bölüme ayrılmıştır:

1. **Backend (`/backend`)**: Java Spring Boot kullanılarak geliştirilmiş mikroservisler (User, Product, Cart, Order, Recommendation) ve API Gateway.
2. **Frontend (`/frontend`)**: 
   - **main-site**: Müşteriler için SEO uyumlu ve hızlı çalışan Next.js uygulaması.
   - **admin-panel**: Sistem yöneticileri için geliştirilmiş hızlı SPA yapısına sahip Vite & React tabanlı gösterge paneli.

## Altyapı ve Teknolojiler

- **Backend**: Spring Boot 3, Spring Cloud Gateway, PostgreSQL, RabbitMQ, JWT, Swagger.
- **Frontend**: React, Next.js (App Router), Vite, TypeScript.
- **DevOps**: Docker, Docker Compose, GitHub Actions.

## Geliştirme Ortamını Çalıştırma

Tüm mikroservislerin ihtiyaç duyduğu altyapı bağımlılıklarını (PostgreSQL ve RabbitMQ) başlatmak için kök dizinde aşağıdaki komutu çalıştırabilirsiniz:

```bash
docker-compose up -d
```

### Mikroservisleri Çalıştırma

Her bir mikroservis standart Spring Boot uygulamasıdır. `backend` dizinine gidip her birini `mvn spring-boot:run` komutu ile veya IDE'niz üzerinden başlatabilirsiniz.

### Frontend Projelerini Çalıştırma

**Main Site (Müşteri Arayüzü):**
```bash
cd frontend/main-site
npm install
npm run dev
```

**Admin Panel (Yönetici Arayüzü):**
```bash
cd frontend/admin-panel
npm install
npm run dev
```

## Docker Container Olarak Çalıştırma

Her projenin içinde kendi `Dockerfile`'ı mevcuttur. İstendiğinde imajlar oluşturulup tüm sistem izole olarak ayağa kaldırılabilir.
