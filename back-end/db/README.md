# Database scripts

SQL chạy thật của backend nằm trong thư mục này.

## Files

- `schema.sql`: tạo lại schema PostgreSQL cho môi trường dev/demo.
- `seed.sql`: dữ liệu mẫu.
- `migrations/`: các bản vá schema sau này.
- `reset.sh`: chạy lại `schema.sql` và `seed.sql` bằng `DATABASE_URL`.

## Cách chạy thủ công

Tạo database PostgreSQL trước, sau đó chạy:

```bash
psql "$DATABASE_URL" -f back-end/db/schema.sql
psql "$DATABASE_URL" -f back-end/db/seed.sql
```

Hoặc từ root repo:

```bash
DATABASE_URL="postgres://postgres:password@localhost:5432/badminton_tournament" bash back-end/db/reset.sh
```

Lưu ý: `schema.sql` có `DROP SCHEMA IF EXISTS public CASCADE`, chỉ dùng cho dev/demo reset DB.
