# My Project (SE104 - Đồ án)

Dự án này là một ứng dụng Full-stack cơ bản bao gồm Front-end xây dựng với React (Vite) và Back-end hoạt động qua Node.js (Express).

## 🚀 Công nghệ sử dụng

- **Front-end**: React 19, TypeScript, Vite, Tailwind CSS v4, Axios.
- **Back-end**: Node.js, Express.js, CORS (ES Modules), Zod.

## 📁 Cấu trúc thư mục

```text
.
├── back-end/               # Thư mục mã nguồn cho máy chủ Node.js/Express
│   ├── package.json        
│   └── server.js           # Chứa logic server (port 8080) và API endpoints
└── front-end/              # Thư mục ứng dụng web React 
    ├── src/                # Mã nguồn React components, styles (.tsx, .css)
    ├── package.json        
    ├── vite.config.ts      # Cấu hình Vite
    └── ...
```

## 🛠 Hướng dẫn Cài đặt & Khởi chạy (Setup)

### Yêu cầu hệ thống
- Tải và cài đặt **[Node.js](https://nodejs.org/)** (phiên bản 18+ được khuyến nghị).
- (Tuỳ chọn) Cài **Docker Desktop** nếu muốn chạy Postgres + Redis bằng `docker-compose`.

### 0. Khởi chạy Postgres + Redis (tuỳ chọn)

```bash
docker-compose up -d
```

> Dùng `.env.example` trong `back-end` để cấu hình `DATABASE_URL` và `REDIS_URL` phù hợp nếu bạn chạy Postgres/Redis riêng.

### 1. Khởi chạy Back-end

Mở terminal và di chuyển vào thư mục `back-end`:
```bash
cd back-end
```
Cấu hình môi trường:
```bash
cp .env.example .env
```
Cài đặt các gói phụ thuộc (Express, CORS):
```bash
npm install
```
Khởi động server:
```bash
npm run dev
```
> **Lưu ý**: Server sẽ chạy tại địa chỉ `http://localhost:3000`.
> **API docs**: `http://localhost:3000/api/docs` (Swagger UI).

### 2. Khởi chạy Front-end

Mở một terminal **mới** (giữ terminal của back-end tiếp tục chạy) và di chuyển vào thư mục `front-end`:
```bash
cd front-end
```
Cấu hình môi trường:
```bash
cp .env.example .env
```
Cài đặt các gói phụ thuộc:
```bash
npm install
```
Khởi động môi trường phát triển (Development Server):
```bash
npm run dev
```
> **Lưu ý**: Website sẽ khởi chạy tại địa chỉ `http://localhost:5173`. Tính năng gọi API từ back-end đã được cấu hình CORS để chấp nhận request từ port này.
