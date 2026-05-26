Module template (routes/controller/service/repo)

How to use:
1) Copy this folder and rename it to your module name.
2) Replace module string, function names, and SQL table/columns.
3) Register the routes in server.js.

Notes:
- Keep routes thin, controllers validate, services handle business rules, repo handles SQL.
- Keep response shape consistent: { data } or { error }.
- For list endpoints, return { data, meta: { page, limit, total } }.

Validation:
- Use zod + validateBody(schema) in routes.

Pagination:
- Use parsePagination(req.query) in controller.
- Pass { limit, offset } to repo and return total count.

Layers:
- Routes: khai báo endpoint và middleware.
- Controller: nhận request, validate đơn giản, gọi service, trả response.
- Service: xử lý nghiệp vụ, gọi repo.
- Repo: chứa câu SQL, chỉ làm việc với DB